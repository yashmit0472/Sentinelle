from fastapi import FastAPI
from dotenv import load_dotenv
import os
import shutil

load_dotenv(dotenv_path="../.env")

from minio_client import minio_client
from video_processor import extract_frames
from yolo_detector import detect_objects
from text_detector import detect_threat_text
from audio_detector import detect_threat_audio

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


def build_audio_comment(audio_findings):
    terms = sorted({
        term
        for finding in audio_findings
        for term in finding.get("matchedTerms", [])
    })

    if len(terms) == 1:
        return (
            "Audio detection flagged this timestamp because spoken audio "
            f"contains the threat keyword: {terms[0]}."
        )

    return (
        "Audio detection flagged this timestamp because spoken audio "
        "contains threat keywords: "
        + ", ".join(terms)
        + "."
    )


def get_category(has_object, has_text, has_audio):
    count = sum([has_object, has_text, has_audio])

    if count > 1:
        return "multiple"

    if has_object:
        return "harmful_object"

    if has_text:
        return "threat_text"

    if has_audio:
        return "threat_audio"

    return "other"


def get_detection_source(has_object, has_text, has_audio):
    count = sum([has_object, has_text, has_audio])

    if count > 1:
        return "multi"

    if has_object:
        return "object"

    if has_text:
        return "text"

    if has_audio:
        return "audio"

    return "manual"


def find_nearest_frame(audio_seconds, frame_files):
    if not frame_files:
        return None

    return min(
        frame_files,
        key=lambda frame: abs(
            timestamp_from_frame_name(frame) - audio_seconds
        )
    )


def create_empty_evidence(frame):
    timestamp_seconds = timestamp_from_frame_name(frame)

    return {
        "frameName": frame,
        "timestampSeconds": timestamp_seconds,
        "timestampLabel": format_timestamp(timestamp_seconds),

        "objectDetections": [],
        "ocrText": "",
        "textTerms": [],
        "textSeverity": None,

        "audioFindings": [],
    }


def build_incident(video_job_id, flagged_bucket, evidence):
    frame = evidence["frameName"]
    frame_object_name = f"{video_job_id}/{frame}"

    object_detections = evidence["objectDetections"]
    has_object = len(object_detections) > 0

    has_text = len(evidence["textTerms"]) > 0
    has_audio = len(evidence["audioFindings"]) > 0

    comments = []

    if has_object:
        comments.append(build_object_comment(object_detections))

    if has_text:
        comments.append(build_text_comment(evidence["textTerms"]))

    if has_audio:
        comments.append(build_audio_comment(evidence["audioFindings"]))

    object_confidence = 0

    if has_object:
        object_confidence = max(
            detection["confidence"]
            for detection in object_detections
        )

    text_confidence = 0.75 if has_text else 0

    audio_confidence = 0

    if has_audio:
        audio_confidence = max(
            finding.get("confidence", 0)
            for finding in evidence["audioFindings"]
        )

    object_severity = (
        severity_from_detections(object_detections)
        if has_object
        else None
    )

    audio_severities = [
        finding.get("severity")
        for finding in evidence["audioFindings"]
    ]

    matched_terms = sorted(set(
        [detection["label"] for detection in object_detections]
        + evidence["textTerms"]
        + [
            term
            for finding in evidence["audioFindings"]
            for term in finding.get("matchedTerms", [])
        ]
    ))

    transcript_text = " ".join([
        finding.get("transcriptText", "")
        for finding in evidence["audioFindings"]
        if finding.get("transcriptText")
    ])

    return {
        "frameObjectName": frame_object_name,
        "frameBucketName": flagged_bucket,
        "frameName": frame,

        "timestampSeconds": evidence["timestampSeconds"],
        "timestampLabel": evidence["timestampLabel"],

        "category": get_category(
            has_object,
            has_text,
            has_audio
        ),
        "detectionSource": get_detection_source(
            has_object,
            has_text,
            has_audio
        ),

        "severity": highest_severity([
            object_severity,
            evidence["textSeverity"],
            *audio_severities,
        ]),
        "confidence": max(
            object_confidence,
            text_confidence,
            audio_confidence,
        ),

        "matchedTerms": matched_terms,
        "detections": object_detections,

        "ocrText": evidence["ocrText"],
        "transcriptText": transcript_text,

        "explanation": " ".join(comments),
        "recommendedAction": (
            "Review this flagged evidence and verify whether the detected "
            "object, visible text, or spoken audio indicates a real "
            "security threat."
        ),
    }


@app.post("/process")
def process_video(payload: dict):
    video_job_id = payload["videoJobId"]
    bucket_name = payload["bucketName"]
    object_name = payload["objectName"]

    print(f"Processing video job {video_job_id}")

    temp_video_dir = "temp/videos"
    temp_frame_dir = f"temp/frames/{video_job_id}"
    temp_audio_dir = f"temp/audio/{video_job_id}"

    os.makedirs(temp_video_dir, exist_ok=True)
    os.makedirs(temp_audio_dir, exist_ok=True)

    video_filename = os.path.basename(object_name)
    local_video_path = os.path.join(
        temp_video_dir,
        video_filename
    )

    flagged_bucket = os.getenv("MINIO_BUCKET_FRAMES", "flagged-frames")

    evidence_by_frame = {}

    total_frames = 0
    processed_frames = 0

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
                evidence = evidence_by_frame.get(
                    frame,
                    create_empty_evidence(frame)
                )

                if has_object_threat:
                    evidence["objectDetections"] = object_detections

                if has_text_threat:
                    evidence["ocrText"] = text_result["ocrText"]
                    evidence["textTerms"] = text_result["matchedTerms"]
                    evidence["textSeverity"] = text_result["severity"]

                evidence_by_frame[frame] = evidence

        print("Running audio threat detection...")

        audio_findings = detect_threat_audio(
            local_video_path,
            temp_audio_dir
        )

        for finding in audio_findings:
            audio_seconds = int(finding.get("timestampSeconds", 0))
            nearest_frame = find_nearest_frame(
                audio_seconds,
                frame_files
            )

            if not nearest_frame:
                continue

            evidence = evidence_by_frame.get(
                nearest_frame,
                create_empty_evidence(nearest_frame)
            )

            evidence["audioFindings"].append(finding)

            evidence_by_frame[nearest_frame] = evidence

        incidents = []

        for frame, evidence in evidence_by_frame.items():
            frame_path = os.path.join(
                temp_frame_dir,
                frame
            )

            frame_object_name = f"{video_job_id}/{frame}"

            minio_client.fput_object(
                flagged_bucket,
                frame_object_name,
                frame_path,
                content_type="image/jpeg"
            )

            incident = build_incident(
                video_job_id,
                flagged_bucket,
                evidence
            )

            incidents.append(incident)

            print(
                f"Flagged {frame} at {incident['timestampLabel']}: "
                f"{incident['matchedTerms']}"
            )

        return {
            "status": "processed",
            "videoJobId": video_job_id,
            "totalFrames": total_frames,
            "processedFrames": processed_frames,
            "flaggedFrames": len(incidents),
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
            "flaggedFrames": 0,
            "incidents": [],
        }

    finally:
        if os.path.exists(local_video_path):
            os.remove(local_video_path)

        if os.path.exists(temp_frame_dir):
            shutil.rmtree(temp_frame_dir)

        if os.path.exists(temp_audio_dir):
            shutil.rmtree(temp_audio_dir)