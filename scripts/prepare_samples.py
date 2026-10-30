import random
from pathlib import Path
from PIL import Image, ImageDraw

def create_sample_leaf(output_path, leaf_color, lesion_color=None, has_rings=False, halo=None):
    img = Image.new("RGB", (320, 320), color=(248, 250, 252))
    draw = ImageDraw.Draw(img)

    # Leaf blade polygon
    leaf_points = [
        (160, 25),
        (260, 100),
        (275, 200),
        (225, 280),
        (160, 305),
        (95, 280),
        (45, 200),
        (60, 100)
    ]
    draw.polygon(leaf_points, fill=leaf_color)

    # Main vein
    draw.line([(160, 30), (160, 300)], fill=(leaf_color[0]+25, leaf_color[1]+25, leaf_color[2]+15), width=4)
    # Lateral veins
    for y in range(65, 270, 35):
        draw.line([(160, y), (225, y - 20)], fill=(leaf_color[0]+15, leaf_color[1]+15, leaf_color[2]+10), width=2)
        draw.line([(160, y), (95, y - 20)], fill=(leaf_color[0]+15, leaf_color[1]+15, leaf_color[2]+10), width=2)

    # Lesions if any
    if lesion_color:
        spots = [(130, 110, 18), (200, 160, 22), (120, 220, 16), (190, 230, 14), (160, 170, 20)]
        for cx, cy, radius in spots:
            if halo:
                draw.ellipse([cx - radius - 5, cy - radius - 5, cx + radius + 5, cy + radius + 5], fill=halo)
            draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=lesion_color)
            if has_rings:
                inner_r = max(3, radius // 2)
                draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], outline=(lesion_color[0]+40, lesion_color[1]+30, lesion_color[2]+20), width=2)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, "JPEG", quality=95)

def main():
    samples_dir = Path(__file__).resolve().parent.parent / "data" / "sample_images"
    samples_dir.mkdir(parents=True, exist_ok=True)

    samples = [
        ("tomato_early_blight.jpg", (60, 125, 50), (45, 28, 15), True, (185, 175, 55)),
        ("tomato_healthy.jpg", (45, 155, 50), None, False, None),
        ("potato_early_blight.jpg", (65, 120, 45), (40, 25, 12), True, (170, 160, 40)),
        ("corn_common_rust.jpg", (85, 140, 40), (160, 65, 30), False, (190, 150, 60)),
        ("apple_scab.jpg", (55, 130, 48), (28, 38, 28), False, None),
    ]

    for filename, leaf_c, lesion_c, rings, halo in samples:
        out_file = samples_dir / filename
        create_sample_leaf(out_file, leaf_c, lesion_c, rings, halo)
        print(f"Created sample leaf image: {out_file}")

if __name__ == "__main__":
    main()
