from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Sentinelle AI Worker")

@app.get("/health")
def health():
    return {"status": "ok", "service": "sentinelle-ai-worker"}

@app.post("/process")
def process_placeholder(payload: dict):
    return {"received": payload, "status": "queued"}