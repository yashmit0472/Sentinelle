from ultralytics import YOLO
import os

DEFAULT_THREAT_OBJECT_CLASSES = {
    "gun",
    "pistol",
    "rifle",
    "knife",
    "grenade",
    "bomb",
    "explosive",
}

model_path = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")

if model_path and os.path.exists(model_path):
    print(f"Loading YOLO model from: {model_path}")
    model = YOLO(model_path)
else:
    print("YOLO_MODEL_PATH not found. Falling back to yolov8n.pt")
    model = YOLO("yolov8n.pt")

confidence_threshold = float(
    os.getenv("YOLO_CONFIDENCE_THRESHOLD", "0.35")
)

env_classes = os.getenv("THREAT_OBJECT_CLASSES")

if env_classes:
    THREAT_OBJECT_CLASSES = {
        item.strip().lower()
        for item in env_classes.split(",")
        if item.strip()
    }
else:
    THREAT_OBJECT_CLASSES = DEFAULT_THREAT_OBJECT_CLASSES

MODEL_CLASSES = {
    str(name).lower()
    for name in model.names.values()
}

SUPPORTED_THREAT_CLASSES = THREAT_OBJECT_CLASSES.intersection(MODEL_CLASSES)
MISSING_THREAT_CLASSES = THREAT_OBJECT_CLASSES.difference(MODEL_CLASSES)

print("YOLO model loaded.")
print(f"YOLO confidence threshold: {confidence_threshold}")
print(f"Threat object classes configured: {sorted(THREAT_OBJECT_CLASSES)}")
print(f"Threat classes supported by this model: {sorted(SUPPORTED_THREAT_CLASSES)}")

if MISSING_THREAT_CLASSES:
    print(
        "WARNING: These threat classes are configured but not present "
        f"in the YOLO model labels: {sorted(MISSING_THREAT_CLASSES)}"
    )
    print(
        "These objects cannot be detected until you use a custom model "
        "trained with these labels."
    )


def detect_objects(frame_path):
    results = model(frame_path, verbose=False)
    detections = []

    for result in results:
        for box in result.boxes:
            class_name = model.names[int(box.cls[0])].lower()
            confidence = float(box.conf[0])

            if confidence < confidence_threshold:
                continue

            if class_name in THREAT_OBJECT_CLASSES:
                detections.append({
                    "label": class_name,
                    "confidence": confidence,
                    "bbox": box.xyxy[0].tolist(),
                })

    return detections