from minio import Minio
import os

minio_client = Minio(
    f"{os.getenv('MINIO_ENDPOINT')}:{os.getenv('MINIO_PORT')}",
    access_key=os.getenv('MINIO_ACCESS_KEY'),
    secret_key=os.getenv('MINIO_SECRET_KEY'),
    secure=False,
)