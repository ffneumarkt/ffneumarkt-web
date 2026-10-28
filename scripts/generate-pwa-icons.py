#!/usr/bin/env python3
"""Generates the PWA icons in public/icons from public/Logo_ffneumarkt_grey.png.

Requires Pillow (pip install Pillow). Run from the repository root:
    python3 scripts/generate-pwa-icons.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "public" / "Logo_ffneumarkt_grey.png"
OUT = ROOT / "public" / "icons"

# Both crests at the left edge of the logo, in logo pixels. Both apps use them together, since
# the fire brigade badge alone does not identify a specific fire brigade.
CRESTS_BOX = (0, 0, 664, 768)

WHITE = (255, 255, 255, 255)
GREY = (74, 74, 74, 255)
ACCENT = (175, 43, 30, 255)


def draw_document(size):
    """A sheet of paper with a folded corner and text lines, used as badge on the transport document icon."""
    scale = 4
    s = size * scale
    image = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    stroke = round(s * 0.06)
    left, top, right, bottom = round(s * 0.14), round(s * 0.04), round(s * 0.86), round(s * 0.96)
    fold = round(s * 0.24)
    sheet = [(left, top), (right - fold, top), (right, top + fold), (right, bottom), (left, bottom)]
    # White halo so the symbol stands out on the red and white badge.
    draw.polygon(sheet, fill=WHITE, outline=WHITE, width=stroke * 3)
    draw.line(sheet + [sheet[0]], fill=WHITE, width=stroke * 3, joint="curve")
    draw.polygon(sheet, fill=WHITE)
    draw.line(sheet + [sheet[0]], fill=GREY, width=stroke, joint="curve")
    draw.line([(right - fold, top), (right - fold, top + fold), (right, top + fold)], fill=GREY, width=stroke)
    for i, y in enumerate((0.45, 0.6, 0.75)):
        line_right = right - round(s * (0.14 if i < 2 else 0.3))
        draw.line([(left + round(s * 0.14), round(s * y)), (line_right, round(s * y))], fill=ACCENT, width=stroke)
    return image.resize((size, size), Image.LANCZOS)


def compose(motif, size, padding, background, overlay=None):
    """Centers the motif on a square canvas; padding is the fraction of the edge left free on each side."""
    canvas = Image.new("RGBA", (size, size), background)
    inner = round(size * (1 - 2 * padding))
    ratio = min(inner / motif.width, inner / motif.height)
    resized = motif.resize((round(motif.width * ratio), round(motif.height * ratio)), Image.LANCZOS)
    offset = ((size - resized.width) // 2, (size - resized.height) // 2)
    canvas.alpha_composite(resized, offset)
    if overlay is not None:
        badge = draw_document(round(resized.width * 0.42))
        canvas.alpha_composite(
            badge,
            (offset[0] + resized.width - badge.width * 3 // 5, offset[1] + resized.height - badge.height),
        )
    return canvas


def main():
    logo = Image.open(LOGO).convert("RGBA")
    crests = logo.crop(CRESTS_BOX)
    crests = crests.crop(crests.getbbox())
    OUT.mkdir(parents=True, exist_ok=True)

    apps = {
        "site": (crests, None),
        "transport-document": (crests, "document"),
    }
    transparent = (0, 0, 0, 0)
    for name, (motif, overlay) in apps.items():
        # The document symbol extends beyond the crests, so they get a bit more room.
        extra = 0.04 if overlay else 0
        for size in (192, 512):
            compose(motif, size, 0.06 + extra, transparent, overlay).save(OUT / f"{name}-{size}.png", optimize=True)
            # Maskable icons must keep their content inside the central 80 % circle; the crest corners need 21 %.
            compose(motif, size, 0.21 + extra, WHITE, overlay).save(OUT / f"{name}-maskable-{size}.png", optimize=True)
        # iOS fills transparency with black, so the touch icon gets a white background. There must be no
        # /apple-touch-icon.png: iOS prefers it over the page's link, so both apps would get the same icon.
        compose(motif, 180, 0.1 + extra, WHITE, overlay).convert("RGB").save(OUT / f"{name}-apple-touch.png", optimize=True)


if __name__ == "__main__":
    main()
