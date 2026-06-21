from fastapi import FastAPI
from dotenv import load_dotenv

import os
import shutil

from minio_client import minio_client
from video_processor import extract_frames

load_dotenv()

app = FastAPI(title="Sentinelle AI Worker")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "sentinelle-ai-worker"
    }


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

    # Download from MinIO
    minio_client.fget_object(
        bucket_name,
        object_name,
        local_video_path
    )

    frame_files = extract_frames(
        local_video_path,
        temp_frame_dir
    )

    uploaded_frames = 0

    for frame in frame_files:

        frame_path = os.path.join(
            temp_frame_dir,
            frame
        )

        frame_object_name = (
            f"{video_job_id}/{frame}"
        )

        minio_client.fput_object(
            os.getenv("MINIO_BUCKET_FRAMES"),
            frame_object_name,
            frame_path,
            content_type="image/jpeg"
        )

        uploaded_frames += 1

    # Cleanup
    if os.path.exists(local_video_path):
        os.remove(local_video_path)

    if os.path.exists(temp_frame_dir):
        shutil.rmtree(temp_frame_dir)

    return {
        "status": "processed",
        "videoJobId": video_job_id,
        "totalFrames": uploaded_frames,
        "processedFrames": uploaded_frames,
        "flaggedFrames": 0
    }