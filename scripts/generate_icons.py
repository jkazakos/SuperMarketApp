#!/usr/bin/env python3

import os
import subprocess

from PIL import Image

ASSETS_DIR = "/home/jason/Workspace/SuperMarketApp/assets/images"
os.makedirs(ASSETS_DIR, exist_ok=True)

# Standard Material shopping_cart SVG path (24x24 viewBox)
CART_PATH = "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"


def render_svg_to_png(
    svg_content: str,
    output_path: str,
    width: int = 1024,
    height: int = 1024,
    mode: str = "RGBA",
):
    """Renders SVG string to PNG using ImageMagick and converts to desired mode using Pillow."""
    subprocess.run(
        ["magick", "-background", "none", "svg:-", output_path],
        input=svg_content.encode("utf-8"),
        check=True,
    )
    # Ensure correct mode and exact dimensions
    with Image.open(output_path) as im:
        if mode == "RGB":
            converted = im.convert("RGB")
        else:
            converted = im.convert("RGBA")
        converted.save(output_path, "PNG")


def create_svg(
    bg_color: str,
    fill_color: str,
    icon_scale: float = 0.52,
    icon_x_offset: float = 0.0,
    icon_y_offset: float = 0.0,
) -> str:
    """
    Creates an SVG with given background color and icon fill color.
    The cart icon is translated and scaled to be centered at (512, 512).
    """
    bg_rect = (
        f'<rect width="1024" height="1024" fill="{bg_color}"/>'
        if bg_color and bg_color != "none"
        else ""
    )

    # Scale from 24x24
    scale_factor = (1024 * icon_scale) / 24.0
    # Center of glyph path in 24x24 box is approximately (11.75, 12.0)
    # Target center = (512 + icon_x_offset, 512 + icon_y_offset)
    translate_x = (512.0 + icon_x_offset) - (11.75 * scale_factor)
    translate_y = (512.0 + icon_y_offset) - (12.0 * scale_factor)

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  {bg_rect}
  <g transform="translate({translate_x:.2f}, {translate_y:.2f}) scale({scale_factor:.4f})">
    <path fill="{fill_color}" d="{CART_PATH}"/>
  </g>
</svg>"""
    return svg


def main():
    icons_to_generate = [
        # 1. Base / Universal Icon: Electric Indigo background with crisp white cart (RGB, opaque)
        {
            "name": "icon.png",
            "bg": "#4F46E5",
            "fill": "#FFFFFF",
            "scale": 0.50,
            "mode": "RGB",
        },
        # 2. iOS Light Icon: Clean light background with Electric Indigo cart (RGB, opaque)
        {
            "name": "icon-light.png",
            "bg": "#F8FAFC",
            "fill": "#4F46E5",
            "scale": 0.50,
            "mode": "RGB",
        },
        # 3. iOS Dark Icon: Deep dark background with crisp white cart (RGB, opaque)
        {
            "name": "icon-dark.png",
            "bg": "#111827",
            "fill": "#FFFFFF",
            "scale": 0.50,
            "mode": "RGB",
        },
        # 4. iOS Tinted Icon: Apple HIG tinted base (dark gray with white high-contrast glyph, RGB, opaque)
        {
            "name": "icon-tinted.png",
            "bg": "#18181B",
            "fill": "#FFFFFF",
            "scale": 0.50,
            "mode": "RGB",
        },
        # 5. Android Adaptive Foreground: Transparent background, white cart inside safe zone (RGBA, transparent)
        {
            "name": "android-adaptive-foreground.png",
            "bg": "none",
            "fill": "#FFFFFF",
            "scale": 0.44,
            "mode": "RGBA",
        },
        # 6. Android Adaptive Monochrome: Transparent background, white cart inside safe zone (RGBA, transparent)
        {
            "name": "android-adaptive-monochrome.png",
            "bg": "none",
            "fill": "#FFFFFF",
            "scale": 0.44,
            "mode": "RGBA",
        },
        # 7. Splash Screen Icon: Transparent background, white cart (RGBA, transparent)
        {
            "name": "splash-icon.png",
            "bg": "none",
            "fill": "#FFFFFF",
            "scale": 0.40,
            "mode": "RGBA",
        },
    ]

    for item in icons_to_generate:
        svg = create_svg(
            bg_color=item["bg"],
            fill_color=item["fill"],
            icon_scale=item["scale"],
            icon_x_offset=0.0,
            icon_y_offset=0.0,
        )
        out_path = os.path.join(ASSETS_DIR, item["name"])
        render_svg_to_png(svg, out_path, 1024, 1024, mode=item["mode"])
        print(f"Generated: {out_path} ({item['mode']})")


if __name__ == "__main__":
    main()
