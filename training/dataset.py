import os
import shutil
import random
from pathlib import Path
from typing import List, Tuple, Dict, Optional
from PIL import Image, ImageDraw
import torch
from torch.utils.data import Dataset, DataLoader
from .transforms import get_train_transforms, get_eval_transforms

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

class ValidatedImageFolder(Dataset):
    """
    Image dataset that validates file integrity on scan and maps class subdirectories to class indices.
    """
    def __init__(self, root_dir: str, transform=None, classes: Optional[List[str]] = None):
        self.root_dir = Path(root_dir)
        self.transform = transform
        
        # Discover classes
        if classes is not None:
            self.classes = sorted(classes)
        else:
            self.classes = sorted([d.name for d in self.root_dir.iterdir() if d.is_dir()])
            
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        self.samples: List[Tuple[Path, int]] = []
        
        self._scan_and_validate()

    def _scan_and_validate(self):
        for cls_name in self.classes:
            cls_dir = self.root_dir / cls_name
            if not cls_dir.exists():
                continue
            idx = self.class_to_idx[cls_name]
            for file_path in cls_dir.iterdir():
                if file_path.suffix.lower() in VALID_EXTENSIONS:
                    try:
                        # Verify file can be read and decoded
                        with Image.open(file_path) as img:
                            img.verify()
                        self.samples.append((file_path, idx))
                    except Exception:
                        # Skip corrupt images
                        continue

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        file_path, target = self.samples[idx]
        with Image.open(file_path) as img:
            img = img.convert("RGB")
            if self.transform:
                img = self.transform(img)
            return img, target

def create_dataloaders(
    data_dir: str,
    batch_size: int = 16,
    num_workers: int = 0
) -> Tuple[DataLoader, DataLoader, Optional[DataLoader], List[str]]:
    """
    Creates train, val, and test dataloaders from data_dir.
    Supports either pre-split (train/val/test) or single folder directory.
    """
    base_path = Path(data_dir)
    train_dir = base_path / "train"
    val_dir = base_path / "val"
    test_dir = base_path / "test"

    train_tf = get_train_transforms()
    eval_tf = get_eval_transforms()

    if train_dir.exists() and val_dir.exists():
        train_ds = ValidatedImageFolder(str(train_dir), transform=train_tf)
        val_ds = ValidatedImageFolder(str(val_dir), transform=eval_tf, classes=train_ds.classes)
        test_ds = None
        if test_dir.exists():
            test_ds = ValidatedImageFolder(str(test_dir), transform=eval_tf, classes=train_ds.classes)
        
        classes = train_ds.classes
    else:
        # Single folder -> reproducible split
        full_ds = ValidatedImageFolder(str(base_path), transform=None)
        classes = full_ds.classes
        
        total_len = len(full_ds)
        indices = list(range(total_len))
        random.seed(42)
        random.shuffle(indices)

        train_split = int(0.70 * total_len)
        val_split = int(0.85 * total_len)

        train_indices = indices[:train_split]
        val_indices = indices[train_split:val_split]
        test_indices = indices[val_split:]

        class SubDataset(Dataset):
            def __init__(self, full_dataset, indices, transform):
                self.full_dataset = full_dataset
                self.indices = indices
                self.transform = transform

            def __len__(self):
                return len(self.indices)

            def __getitem__(self, idx):
                real_idx = self.indices[idx]
                file_path, target = self.full_dataset.samples[real_idx]
                with Image.open(file_path) as img:
                    img = img.convert("RGB")
                    if self.transform:
                        img = self.transform(img)
                    return img, target

        train_ds = SubDataset(full_ds, train_indices, train_tf)
        val_ds = SubDataset(full_ds, val_indices, eval_tf)
        test_ds = SubDataset(full_ds, test_indices, eval_tf) if len(test_indices) > 0 else val_ds

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=num_workers)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers) if test_ds else val_loader

    return train_loader, val_loader, test_loader, classes

def generate_fixture_dataset(base_dir: str, num_samples_per_class: int = 12):
    """
    Generates a structured fixture dataset with realistic foliage colors, veins, and lesions
    specifically for pipeline smoke-testing, automated integration tests, and UI demo samples.
    NOT intended as clinical ground truth.
    """
    classes_config = {
        "Tomato___Early_blight": {
            "bg": (60, 120, 50),
            "lesion_color": (50, 30, 20),
            "has_rings": True,
            "halo": (180, 170, 50)
        },
        "Tomato___Late_blight": {
            "bg": (55, 110, 45),
            "lesion_color": (35, 30, 25),
            "has_rings": False,
            "halo": (120, 130, 110)
        },
        "Tomato___healthy": {
            "bg": (50, 150, 55),
            "lesion_color": None,
            "has_rings": False,
            "halo": None
        },
        "Potato___Early_blight": {
            "bg": (65, 125, 48),
            "lesion_color": (45, 28, 15),
            "has_rings": True,
            "halo": (175, 160, 45)
        },
        "Potato___healthy": {
            "bg": (45, 145, 40),
            "lesion_color": None,
            "has_rings": False,
            "halo": None
        },
        "Corn_(maize)___Common_rust_": {
            "bg": (80, 140, 40),
            "lesion_color": (150, 60, 25),
            "has_rings": False,
            "halo": (180, 140, 50)
        },
        "Corn_(maize)___healthy": {
            "bg": (70, 150, 45),
            "lesion_color": None,
            "has_rings": False,
            "halo": None
        },
        "Apple___Apple_scab": {
            "bg": (60, 130, 50),
            "lesion_color": (30, 40, 30),
            "has_rings": False,
            "halo": None
        },
        "Apple___healthy": {
            "bg": (55, 145, 45),
            "lesion_color": None,
            "has_rings": False,
            "halo": None
        }
    }

    base = Path(base_dir)
    random.seed(1337)

    for split in ["train", "val", "test"]:
        samples_count = num_samples_per_class if split == "train" else max(3, num_samples_per_class // 3)
        for cls_name, cfg in classes_config.items():
            cls_folder = base / split / cls_name
            cls_folder.mkdir(parents=True, exist_ok=True)

            for i in range(samples_count):
                img = Image.new("RGB", (256, 256), color=(240, 240, 240))
                draw = ImageDraw.Draw(img)

                # Draw leaf blade polygon
                leaf_bg = cfg["bg"]
                # Slight variation
                var = random.randint(-10, 10)
                leaf_color = (
                    max(0, min(255, leaf_bg[0] + var)),
                    max(0, min(255, leaf_bg[1] + var)),
                    max(0, min(255, leaf_bg[2] + var))
                )
                
                # Leaf shape
                leaf_points = [
                    (128, 20),
                    (210, 80),
                    (220, 160),
                    (180, 220),
                    (128, 240),
                    (76, 220),
                    (36, 160),
                    (46, 80)
                ]
                draw.polygon(leaf_points, fill=leaf_color)

                # Main central vein
                draw.line([(128, 25), (128, 235)], fill=(leaf_color[0]+20, leaf_color[1]+20, leaf_color[2]+10), width=3)
                # Lateral veins
                for y in range(50, 210, 30):
                    draw.line([(128, y), (180, y - 15)], fill=(leaf_color[0]+15, leaf_color[1]+15, leaf_color[2]+10), width=1)
                    draw.line([(128, y), (76, y - 15)], fill=(leaf_color[0]+15, leaf_color[1]+15, leaf_color[2]+10), width=1)

                # If disease, draw realistic lesions
                if cfg["lesion_color"] is not None:
                    lesion_c = cfg["lesion_color"]
                    num_spots = random.randint(3, 7)
                    for _ in range(num_spots):
                        cx = random.randint(70, 185)
                        cy = random.randint(60, 200)
                        radius = random.randint(8, 22)

                        if cfg["halo"]:
                            draw.ellipse(
                                [cx - radius - 4, cy - radius - 4, cx + radius + 4, cy + radius + 4],
                                fill=cfg["halo"]
                            )

                        draw.ellipse(
                            [cx - radius, cy - radius, cx + radius, cy + radius],
                            fill=lesion_c
                        )

                        if cfg["has_rings"]:
                            inner_r = max(2, radius // 2)
                            draw.ellipse(
                                [cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r],
                                outline=(lesion_c[0]+30, lesion_c[1]+20, lesion_c[2]+10),
                                width=2
                            )

                img_path = cls_folder / f"sample_{split}_{i+1}.jpg"
                img.save(img_path, "JPEG", quality=90)
