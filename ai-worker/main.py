from fastapi import FastAPI
from dotenv import load_dotenv
import os
import shutil

load_dotenv(dotenv_path="../.env")

from minio_client import minio_client
from video_processor import extract_frames
from yolo_detector import detect_objects
from text_detector import detect_threat_text

app = FastAPI(title="Sentinelle AI Worker")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "sentinelle-ai-worker"
    }


def timestamp_from_frame_name(frame_name):
    try:
        frame_number = int(
            frame_name.replace("frame_", "").replace(".jpg", "")
        )

        seconds = max(0, (frame_number - 1) * 2)
        return seconds
    except Exception:
        return 0


def format_timestamp(seconds):
    seconds = int(seconds)

    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60

    return f"{hours:02d}:{minutes:02d}:{secs:02d}"


def highest_severity(severities):
    severity_order = {
        "low": 1,
        "medium": 2,
        "high": 3,
        "critical": 4,
    }

    valid_severities = [
        severity for severity in severities if severity in severity_order
    ]

    if not valid_severities:
        return "medium"

    return max(
        valid_severities,
        key=lambda severity: severity_order[severity]
    )


def severity_from_detections(detections):
    labels = {d["label"] for d in detections}

    critical_terms = {
        "gun",
        "pistol",
        "rifle",
        "grenade",
        "bomb",
        "explosive",
    }

    if labels.intersection(critical_terms):
        return "critical"

    return "high"


def build_object_comment(detections):
    labels = sorted({d["label"] for d in detections})

    if len(labels) == 1:
        return (
            "Object detection flagged this frame because it found "
            f"a possible harmful object: {labels[0]}."
        )

    return (
        "Object detection flagged this frame because it found "
        "possible harmful objects: "
        + ", ".join(labels)
        + "."
    )


def build_text_comment(matched_terms):
    if len(matched_terms) == 1:
        return (
            "OCR text detection flagged this frame because visible text "
            f"contains the threat keyword: {matched_terms[0]}."
        )

    return (
        "OCR text detection flagged this frame because visible text "
        "contains threat keywords: "
        + ", ".join(matched_terms)
        + "."
    )


def build_explanation(object_detections, text_result):
    comments = []

    if object_detections:
        comments.append(build_object_comment(object_detections))

    if text_result["flagged"]:
        comments.append(build_text_comment(text_result["matchedTerms"]))

    return " ".join(comments)


def get_category(object_detections, text_result):
    has_object = len(object_detections) > 0
    has_text = text_result["flagged"]

    if has_object and has_text:
        return "multiple"

    if has_object:
        return "harmful_object"

    if has_text:
        return "threat_text"

    return "other"


def get_detection_source(object_detections, text_result):
    has_object = len(object_detections) > 0
    has_text = text_result["flagged"]

    if has_object and has_text:
        return "multi"

    if has_object:
        return "object"

    if has_text:
        return "text"

    return "manual"


@app.post("/process")
def process_video(payload: dict):
    video_job_id = payload["videoJobId"]
    bucket_name = payload["bucketName"]
    object_name = payload["objectName"]

    print(f"Processing video job {video_job_id}")

    temp_video_dir = "temp/videos"
    temp_frame_dir = f"temp/frames/{video_job_id}"

    os.makedirs(temp_video_dir, exist_ok=True)

    video_filename = os.path.basename(object_name)
    local_video_path = os.path.join(
        temp_video_dir,
        video_filename
    )

    flagged_bucket = os.getenv("MINIO_BUCKET_FRAMES", "flagged-frames")

    incidents = []
    total_frames = 0
    processed_frames = 0
    flagged_frames = 0

    try:
        minio_client.fget_object(
            bucket_name,
            object_name,
            local_video_path
        )

        frame_files = extract_frames(
            local_video_path,
            temp_frame_dir
        )

        for frame in frame_files:
            frame_path = os.path.join(
                temp_frame_dir,
                frame
            )

            total_frames += 1
            processed_frames += 1

            object_detections = detect_objects(frame_path)
            text_result = detect_threat_text(frame_path)

            has_object_threat = len(object_detections) > 0
            has_text_threat = text_result["flagged"]

            if has_object_threat or has_text_threat:
                frame_object_name = f"{video_job_id}/{frame}"

                minio_client.fput_object(
                    flagged_bucket,
                    frame_object_name,
                    frame_path,
                    content_type="image/jpeg"
                )

                timestamp_seconds = timestamp_from_frame_name(frame)
                timestamp_label = format_timestamp(timestamp_seconds)

                object_confidence = 0

                if object_detections:
                    object_confidence = max(
                        detection["confidence"]
                        for detection in object_detections
                    )

                text_confidence = 0.75 if has_text_threat else 0
                confidence = max(object_confidence, text_confidence)

                object_terms = [
                    detection["label"]
                    for detection in object_detections
                ]

                text_terms = text_result["matchedTerms"]

                matched_terms = sorted(set(object_terms + text_terms))

                object_severity = (
                    severity_from_detections(object_detections)
                    if has_object_threat
                    else None
                )

                text_severity = (
                    text_result["severity"]
                    if has_text_threat
                    else None
                )

                severity = highest_severity([
                    object_severity,
                    text_severity,
                ])

                incident = {
                    "frameObjectName": frame_object_name,
                    "frameBucketName": flagged_bucket,
                    "frameName": frame,

                    "timestampSeconds": timestamp_seconds,
                    "timestampLabel": timestamp_label,

                    "category": get_category(
                        object_detections,
                        text_result
                    ),
                    "detectionSource": get_detection_source(
                        object_detections,
                        text_result
                    ),

                    "severity": severity,
                    "confidence": confidence,

                    "matchedTerms": matched_terms,
                    "detections": object_detections,

                    "ocrText": text_result["ocrText"],

                    "explanation": build_explanation(
                        object_detections,
                        text_result
                    ),
                    "recommendedAction": (
                        "Review this flagged evidence and verify whether "
                        "the detected object or visible text indicates a "
                        "real security threat."
                    ),
                }

                incidents.append(incident)
                flagged_frames += 1

                print(
                    f"Flagged {frame} at {timestamp_label}: "
                    f"{matched_terms}"
                )

        return {
            "status": "processed",
            "videoJobId": video_job_id,
            "totalFrames": total_frames,
            "processedFrames": processed_frames,
            "flaggedFrames": flagged_frames,
            "incidents": incidents,
        }

    except Exception as error:
        return {
            "status": "failed",
            "videoJobId": video_job_id,
            "message": "Processing failed",
            "error": str(error),
            "totalFrames": total_frames,
            "processedFrames": processed_frames,
            "flaggedFrames": flagged_frames,
            "incidents": incidents,
        }

    finally:
        if os.path.exists(local_video_path):
            os.remove(local_video_path)

        if os.path.exists(temp_frame_dir):
            shutil.rmtree(temp_frame_dir)