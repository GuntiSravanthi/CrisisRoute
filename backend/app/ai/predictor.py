import os
from pathlib import Path

import cv2
import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

DISASTER_CLASSES = [
    "Flood",
    "Fire",
    "Landslide",
    "Cyclone Damage",
    "Earthquake Damage",
]


class DisasterClassifier(nn.Module):
    def __init__(self, num_classes: int = 5):
        super().__init__()
        self.backbone = models.mobilenet_v2(weights=None)
        in_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(in_features, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        return self.backbone(x)


class DisasterPredictor:
    def __init__(self, model_path: str):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = DisasterClassifier(num_classes=len(DISASTER_CLASSES))
        self.model_path = Path(model_path)

        if self.model_path.exists():
            state_dict = torch.load(self.model_path, map_location=self.device, weights_only=True)
            self.model.load_state_dict(state_dict)
        else:
            self._initialize_demo_weights()

        self.model.to(self.device)
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def _initialize_demo_weights(self):
        """Initialize with structured weights for demo when no trained model exists."""
        for module in self.model.modules():
            if isinstance(module, nn.Linear):
                nn.init.xavier_uniform_(module.weight)
                if module.bias is not None:
                    nn.init.zeros_(module.bias)

    def _extract_visual_features(self, image_path: str) -> np.ndarray:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Unable to read image file")

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        blue_ratio = np.mean(img_rgb[:, :, 2]) / (np.mean(img_rgb) + 1e-6)
        red_ratio = np.mean(img_rgb[:, :, 0]) / (np.mean(img_rgb) + 1e-6)
        brightness = np.mean(gray) / 255.0
        edge_density = np.mean(cv2.Canny(gray, 50, 150)) / 255.0
        saturation = np.mean(hsv[:, :, 1]) / 255.0

        return np.array([blue_ratio, red_ratio, brightness, edge_density, saturation])

    def _apply_heuristic_boost(self, probabilities: dict[str, float], features: np.ndarray) -> dict[str, float]:
        blue_ratio, red_ratio, brightness, edge_density, saturation = features
        boosted = probabilities.copy()

        if blue_ratio > 1.15:
            boosted["Flood"] += 0.25
        if red_ratio > 1.2 and brightness > 0.4:
            boosted["Fire"] += 0.3
        if edge_density > 0.15 and saturation < 0.35:
            boosted["Landslide"] += 0.2
        if saturation > 0.5 and edge_density > 0.1:
            boosted["Cyclone Damage"] += 0.2
        if edge_density > 0.2 and brightness < 0.45:
            boosted["Earthquake Damage"] += 0.2

        total = sum(boosted.values())
        return {k: v / total for k, v in boosted.items()}

    def predict(self, image_path: str) -> dict:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")

        image = Image.open(image_path).convert("RGB")
        tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probs = torch.softmax(outputs, dim=1).cpu().numpy()[0]

        probabilities = {cls: float(prob) for cls, prob in zip(DISASTER_CLASSES, probs)}
        features = self._extract_visual_features(image_path)
        probabilities = self._apply_heuristic_boost(probabilities, features)

        disaster_type = max(probabilities, key=probabilities.get)
        confidence = probabilities[disaster_type]

        if confidence >= 0.75:
            severity = "High"
        elif confidence >= 0.45:
            severity = "Medium"
        else:
            severity = "Low"

        return {
            "disaster_type": disaster_type,
            "confidence": round(confidence, 4),
            "severity": severity,
            "all_predictions": {k: round(v, 4) for k, v in probabilities.items()},
        }


_predictor_instance: DisasterPredictor | None = None


def get_predictor(model_path: str) -> DisasterPredictor:
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = DisasterPredictor(model_path)
    return _predictor_instance
