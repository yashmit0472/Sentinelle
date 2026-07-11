import json
import os
import re
from PIL import Image
import pytesseract


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


def find_matched_terms(text, keyword_config):
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


def detect_threat_text(frame_path):
    keyword_config = load_keywords()

    image = Image.open(frame_path)

    raw_text = pytesseract.image_to_string(image)

    matches = find_matched_terms(raw_text, keyword_config)

    if not matches:
        return {
            "flagged": False,
            "ocrText": raw_text,
            "matchedTerms": [],
            "severity": None,
        }

    matched_terms = sorted({
        match["term"]
        for match in matches
    })

    return {
        "flagged": True,
        "ocrText": raw_text,
        "matchedTerms": matched_terms,
        "severity": highest_severity(matches),
    }