"""
Train disaster classification model on custom dataset.

Dataset structure:
dataset/
├── train/
│   ├── Flood/
│   ├── Fire/
│   ├── Landslide/
│   ├── Cyclone Damage/
│   └── Earthquake Damage/
└── val/
    ├── Flood/
    ├── Fire/
    ├── Landslide/
    ├── Cyclone Damage/
    └── Earthquake Damage/

Run: python train.py --data_dir ./dataset --epochs 10
"""

import argparse
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms

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


def get_transforms():
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    return train_transform, val_transform


def train_epoch(model, loader, criterion, optimizer, device):
    model.train()
    total_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    return total_loss / len(loader), 100.0 * correct / total


def validate(model, loader, criterion, device):
    model.eval()
    total_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            total_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

    return total_loss / len(loader), 100.0 * correct / total


def main():
    parser = argparse.ArgumentParser(description="Train CrisisRoute disaster classifier")
    parser.add_argument("--data_dir", type=str, default="./dataset")
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=0.001)
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    train_dir = data_dir / "train"
    val_dir = data_dir / "val"

    if not train_dir.exists():
        print(f"Dataset not found at {train_dir}")
        print("Expected structure:")
        print("  dataset/train/Flood/, dataset/train/Fire/, ...")
        print("  dataset/val/Flood/, dataset/val/Fire/, ...")
        print("\nRun create_model.py to generate a demo model without training.")
        return

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    train_transform, val_transform = get_transforms()

    train_dataset = datasets.ImageFolder(str(train_dir), transform=train_transform)
    val_dataset = datasets.ImageFolder(str(val_dir), transform=val_transform)

    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=0)

    model = DisasterClassifier(num_classes=len(DISASTER_CLASSES)).to(device)

    for param in model.backbone.features.parameters():
        param.requires_grad = False

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=args.lr)

    best_acc = 0.0
    save_dir = Path(__file__).parent / "saved_model"
    save_dir.mkdir(parents=True, exist_ok=True)

    print(f"Training on {device} | Classes: {train_dataset.classes}")
    for epoch in range(1, args.epochs + 1):
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        print(f"Epoch {epoch}/{args.epochs} | Train Loss: {train_loss:.4f} Acc: {train_acc:.1f}% | Val Loss: {val_loss:.4f} Acc: {val_acc:.1f}%")

        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), save_dir / "disaster_classifier.pt")
            print(f"  -> Saved best model (val acc: {val_acc:.1f}%)")

    print(f"Training complete. Best validation accuracy: {best_acc:.1f}%")


if __name__ == "__main__":
    main()
