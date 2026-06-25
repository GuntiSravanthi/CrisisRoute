# CrisisRoute Disaster Classification Dataset

## Folder Structure

Place disaster images in the following directory layout:

```
dataset/
├── train/
│   ├── Flood/
│   │   ├── flood_001.jpg
│   │   ├── flood_002.jpg
│   │   └── ...
│   ├── Fire/
│   │   ├── fire_001.jpg
│   │   └── ...
│   ├── Landslide/
│   │   └── ...
│   ├── Cyclone Damage/
│   │   └── ...
│   └── Earthquake Damage/
│       └── ...
└── val/
    ├── Flood/
    ├── Fire/
    ├── Landslide/
    ├── Cyclone Damage/
    └── Earthquake Damage/
```

## Classes (5)

| Class | Description |
|-------|-------------|
| Flood | Water inundation, submerged roads, urban flooding |
| Fire | Wildfires, building fires, smoke and flames |
| Landslide | Mudslides, rock falls, debris on slopes |
| Cyclone Damage | Storm damage, uprooted trees, roof damage |
| Earthquake Damage | Structural cracks, collapsed buildings |

## Recommended Dataset Sources

- **Kaggle**: Natural Disaster Image Classification datasets
- **Roboflow**: Disaster detection datasets
- **Google Open Images**: Search by disaster keywords
- **Government portals**: NASA MODIS, USGS earthquake photos

## Minimum Images Per Class

- Training: 50+ images per class (recommended 200+)
- Validation: 10+ images per class (recommended 50+)

## Image Requirements

- Format: JPG, PNG, WEBP
- Resolution: Minimum 224x224 (model resizes automatically)
- Quality: Clear, representative disaster scenes

## Training

```bash
cd ai_model
python train.py --data_dir ./dataset --epochs 10 --batch_size 16
```

## Demo Model (No Dataset Required)

```bash
cd ai_model
python create_model.py
```

This creates a pre-initialized MobileNetV2 model with ImageNet transfer learning weights.
