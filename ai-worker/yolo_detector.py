from ultralytics import YOLO

model = YOLO("yolov8n.pt")

RELEVANT_CLASSES = {"person", "car", "truck", "bus", "motorcycle"}

def detect_objects(frame_path):
    results = model(frame_path, verbose=False)
    detections = []

    for result in results:
        for box in result.boxes:
            class_name = model.names[int(box.cls[0])]
            confidence = float(box.conf[0])

            if class_name in RELEVANT_CLASSES:
                detections.append({
                    "class_name": class_name,
                    "confidence": confidence,
                    "bbox": box.xyxy[0].tolist(),
                })

    return detections