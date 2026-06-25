"""
Create a demo disaster classification model using transfer learning.
Run: python create_model.py
"""

import os
from pathlib import Path

import torch
import torch.nn as nn
from torchvision import models

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
        self.backbone = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
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


def main():
    save_dir = Path(__file__).parent / "saved_model"
    save_dir.mkdir(parents=True, exist_ok=True)
    save_path = save_dir / "disaster_classifier.pt"

    print("Creating disaster classification model with MobileNetV2 transfer learning...")
    model = DisasterClassifier(num_classes=len(DISASTER_CLASSES))

    for param in model.backbone.features.parameters():
        param.requires_grad = False

    torch.save(model.state_dict(), save_path)
    print(f"Model saved to: {save_path}")
    print(f"Classes: {DISASTER_CLASSES}")


if __name__ == "__main__":
    main()
