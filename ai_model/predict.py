"""
Predict disaster type from a single image.
Run: python predict.py --image path/to/image.jpg
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.ai.predictor import get_predictor, DISASTER_CLASSES


def main():
    parser = argparse.ArgumentParser(description="Predict disaster type from image")
    parser.add_argument("--image", type=str, required=True, help="Path to disaster image")
    parser.add_argument("--model", type=str, default="./saved_model/disaster_classifier.pt")
    args = parser.parse_args()

    if not Path(args.image).exists():
        print(f"Error: Image not found at {args.image}")
        return

    predictor = get_predictor(args.model)
    result = predictor.predict(args.image)

    print("\n=== CrisisRoute Disaster Detection ===")
    print(f"Disaster Type : {result['disaster_type']}")
    print(f"Confidence    : {result['confidence'] * 100:.1f}%")
    print(f"Severity      : {result['severity']}")
    print("\nAll Predictions:")
    for cls in DISASTER_CLASSES:
        prob = result["all_predictions"].get(cls, 0)
        bar = "█" * int(prob * 30)
        print(f"  {cls:20s} {prob * 100:5.1f}% {bar}")


if __name__ == "__main__":
    main()
