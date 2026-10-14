#!/usr/bin/env python3
"""Generate logo and favicon files from brand name and color.

Uses Pillow if available, falls back to pure SVG generation.

Usage:
    python3 generate-logo.py --brand-name "MyApp" --primary-color "#7c3aed" --public-dir "./public"
"""

import argparse
import os
import struct
import zlib


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def luminance(r: int, g: int, b: int) -> float:
    rs, gs, bs = r / 255.0, g / 255.0, b / 255.0
    rs = rs / 12.92 if rs <= 0.03928 else ((rs + 0.055) / 1.055) ** 2.4
    gs = gs / 12.92 if gs <= 0.03928 else ((gs + 0.055) / 1.055) ** 2.4
    bs = bs / 12.92 if bs <= 0.03928 else ((bs + 0.055) / 1.055) ** 2.4
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs


def fg_color(hex_color: str) -> str:
    r, g, b = hex_to_rgb(hex_color)
    return "#1a1a1a" if luminance(r, g, b) > 0.5 else "#ffffff"


def create_png(width: int, height: int, bg_rgb: tuple, fg_rgb: tuple, letter: str) -> bytes:
    """Create a minimal PNG with colored background and centered letter using Pillow."""
    from PIL import Image, ImageDraw, ImageFont

    img = Image.new("RGBA", (width, height), (*bg_rgb, 255))
    draw = ImageDraw.Draw(img)

    # Try to find a bold system font
    font_size = int(width * 0.55)
    font = None
    font_paths = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSDisplay.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                font = ImageFont.truetype(fp, font_size)
                break
            except Exception:
                continue
    if font is None:
        font = ImageFont.load_default()

    # Center the letter
    bbox = draw.textbbox((0, 0), letter, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (width - tw) / 2 - bbox[0]
    y = (height - th) / 2 - bbox[1]
    draw.text((x, y), letter, fill=(*fg_rgb, 255), font=font)

    import io
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def create_ico(png_16: bytes, png_32: bytes) -> bytes:
    """Create a minimal ICO file from two PNG images."""
    # ICO header: reserved(2) + type(2) + count(2)
    header = struct.pack("<HHH", 0, 1, 2)

    offset = 6 + 16 * 2  # header + 2 directory entries
    entry1 = struct.pack("<BBBBHHII", 16, 16, 0, 0, 1, 32, len(png_16), offset)
    offset += len(png_16)
    entry2 = struct.pack("<BBBBHHII", 32, 32, 0, 0, 1, 32, len(png_32), offset)

    return header + entry1 + entry2 + png_16 + png_32


def main():
    parser = argparse.ArgumentParser(description="Generate logo and favicon files")
    parser.add_argument("--brand-name", required=True, help="Brand name")
    parser.add_argument("--primary-color", required=True, help="Primary color hex (e.g. #7c3aed)")
    parser.add_argument("--public-dir", required=True, help="Output directory (usually ./public)")
    args = parser.parse_args()

    brand = args.brand_name
    color = args.primary_color
    out = args.public_dir
    letter = brand[0].upper()
    bg_rgb = hex_to_rgb(color)
    fg_hex = fg_color(color)
    fg_rgb = hex_to_rgb(fg_hex)

    os.makedirs(out, exist_ok=True)

    try:
        import PIL  # noqa: F401

        print("Using Pillow for PNG generation...")

        # Logo 512x512
        logo_data = create_png(512, 512, bg_rgb, fg_rgb, letter)
        with open(os.path.join(out, "logo.png"), "wb") as f:
            f.write(logo_data)
        print(f"  ✓ logo.png (512x512)")

        # Favicon sizes
        png_16 = create_png(16, 16, bg_rgb, fg_rgb, letter)
        png_32 = create_png(32, 32, bg_rgb, fg_rgb, letter)
        png_180 = create_png(180, 180, bg_rgb, fg_rgb, letter)
        png_192 = create_png(192, 192, bg_rgb, fg_rgb, letter)
        png_512 = create_png(512, 512, bg_rgb, fg_rgb, letter)

        # favicon.ico
        ico_data = create_ico(png_16, png_32)
        with open(os.path.join(out, "favicon.ico"), "wb") as f:
            f.write(ico_data)
        print(f"  ✓ favicon.ico (16x16 + 32x32)")

        # apple-touch-icon
        with open(os.path.join(out, "apple-touch-icon.png"), "wb") as f:
            f.write(png_180)
        print(f"  ✓ apple-touch-icon.png (180x180)")

        # PWA icons
        with open(os.path.join(out, "icon-192.png"), "wb") as f:
            f.write(png_192)
        print(f"  ✓ icon-192.png (192x192)")

        with open(os.path.join(out, "icon-512.png"), "wb") as f:
            f.write(png_512)
        print(f"  ✓ icon-512.png (512x512)")

    except ImportError:
        print("Pillow not available. Generating SVG only.")
        print("Install Pillow for PNG generation: pip install Pillow")

        # Generate SVG logo as fallback
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="80" fill="{color}"/>
  <text x="256" y="256" text-anchor="middle" dominant-baseline="central"
    font-family="system-ui, sans-serif" font-size="280" font-weight="bold"
    fill="{fg_hex}">{letter}</text>
</svg>'''
        with open(os.path.join(out, "logo.svg"), "w") as f:
            f.write(svg)
        print(f"  ✓ logo.svg (fallback)")
        print("\nTo generate PNG favicons from SVG, install ImageMagick and run:")
        print(f'  magick {out}/logo.svg -resize 16x16 /tmp/f16.png')
        print(f'  magick {out}/logo.svg -resize 32x32 /tmp/f32.png')
        print(f'  magick /tmp/f16.png /tmp/f32.png {out}/favicon.ico')

    print("\nDone!")


if __name__ == "__main__":
    main()
