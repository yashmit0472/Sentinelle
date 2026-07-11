import json
import os
import re
import subprocess
import wave
from vosk import Model, KaldiRecognizer


KEYWORDS_PATH = os.path.join(
    os.path.dirname(__file__),
    "config",
    "threat_keywords.json"
)


def load_keywords():
    with open(KEYWORDS_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def normalize_text(text):
    return re.sub(r"\s+", " ", text.lower()).strip()


def find_keyword_matches(text, keyword_config):
    normalized_text = normalize_text(text)
    matches = []

    for severity, terms in keyword_config.items():
        for term in terms:
            normalized_term = term.lower().strip()

            if normalized_term in normalized_text:
                matches.append({
                    "term": term,
                    "severity": severity,
                })

    return matches


def highest_severity(matches):
    order = {
        "medium": 1,
        "high": 2,
        "critical": 3,
    }

    if not matches:
        return "medium"

    return max(
        matches,
        key=lambda item: order.get(item["severity"], 0)
    )["severity"]


def extract_audio_to_wav(video_path, audio_path):
    command = [
        "ffmpeg",
        "-y",
        "-i",
        video_path,
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-f",
        "wav",
        audio_path,
    ]

    subprocess.run(
        command,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )


def transcribe_audio(audio_path):
    model_path = os.getenv("VOSK_MODEL_PATH")

    if not model_path or not os.path.exists(model_path):
        print("Vosk model not found. Skipping audio detection.")
        return []

    model = Model(model_path)

    results = []

    with wave.open(audio_path, "rb") as wav_file:
        recognizer = KaldiRecognizer(
            model,
            wav_file.getframerate()
        )

        recognizer.SetWords(True)

        while True:
            data = wav_file.readframes(4000)

            if len(data) == 0:
                break

            if recognizer.AcceptWaveform(data):
                result = json.loads(recognizer.Result())

                if "result" in result:
                    results.extend(result["result"])

        final_result = json.loads(recognizer.FinalResult())

        if "result" in final_result:
            results.extend(final_result["result"])

    return results


def detect_threat_audio(video_path, temp_dir):
    audio_path = os.path.join(temp_dir, "audio_16k.wav")

    try:
        extract_audio_to_wav(video_path, audio_path)
    except Exception as error:
        print(f"Audio extraction failed or no audio track found: {error}")
        return []

    words = transcribe_audio(audio_path)

    if not words:
        return []

    keyword_config = load_keywords()
    findings = []

    for word_info in words:
        word = word_info.get("word", "")
        start = float(word_info.get("start", 0))
        confidence = float(word_info.get("conf", 0))

        matches = find_keyword_matches(word, keyword_config)

        if not matches:
            continue

        matched_terms = sorted({
            match["term"]
            for match in matches
        })

        findings.append({
            "timestampSeconds": int(start),
            "matchedTerms": matched_terms,
            "severity": highest_severity(matches),
            "confidence": confidence,
            "transcriptText": word,
            "explanation": (
                "Audio detection flagged this timestamp because the "
                f"spoken transcript contains threat keyword: {word}."
            ),
        })

    return findings