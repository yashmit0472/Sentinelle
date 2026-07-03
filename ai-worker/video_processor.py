import os
import subprocess
from pathlib import Path

def extract_frames(video_path, output_dir):
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    output_pattern = os.path.join(
        output_dir,
        "frame_%06d.jpg"
    )

    command = [
        "ffmpeg",
        "-i",
        video_path,
        "-vf",
        "fps=1/2",
        "-q:v",
        "2",
        output_pattern,
        "-hide_banner",
        "-loglevel",
        "error",
    ]

    subprocess.run(command, check=True)

    frame_files = sorted([
        f
        for f in os.listdir(output_dir)
        if f.endswith(".jpg")
    ])

    return frame_files