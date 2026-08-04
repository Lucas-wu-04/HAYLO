#!/usr/bin/env python3
"""Haylo icons — a pixel-faithful reproduction of the supplied brand mark
(Untitled_design.png), redrawn as vector geometry so it stays crisp at 32px.

Measured from that artwork, as fractions of the tile:
  tile   : full-bleed square, #000000, no corner rounding
  ring   : centred, outer radius 43.75%, stroke 4.88%, #FFFFFF
  no dot : the older Android vector had one; this mark does not.
"""
from PIL import Image, ImageDraw
import pathlib

OUT = pathlib.Path("/home/claude/site/icons"); OUT.mkdir(parents=True, exist_ok=True)
BG, FG = (0, 0, 0), (255, 255, 255)
SS = 8

OUTER_R = 0.4375
STROKE = 0.0488


def draw(size, outer_r=OUTER_R):
    S = size * SS
    img = Image.new("RGB", (S, S), BG)
    d = ImageDraw.Draw(img)
    w = STROKE * S
    r = outer_r * S          # PIL strokes INWARD from the bounding box
    c = S / 2
    d.ellipse([c - r, c - r, c + r, c + r], outline=FG, width=max(1, round(w)))
    return img.resize((size, size), Image.LANCZOS)


for n in (192, 512):
    draw(n).save(OUT / f"icon-{n}.png")

# Maskable only: the ring is pulled in to the 40% safe radius the spec guarantees,
# otherwise a launcher's circle mask would slice through it.
draw(512, outer_r=0.40).save(OUT / "icon-maskable-512.png")

draw(180).save(OUT / "apple-touch-icon.png")
draw(32).save(OUT / "favicon-32.png")

r_out = OUTER_R * 108
w = STROKE * 108
(OUT / "favicon.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" role="img" aria-label="Haylo">\n'
    '  <rect width="108" height="108" fill="#000000"/>\n'
    f'  <circle cx="54" cy="54" r="{r_out - w/2:.3f}" fill="none" stroke="#FFFFFF" stroke-width="{w:.3f}"/>\n'
    '</svg>\n',
    encoding="utf-8",
)
print("\n".join(sorted(p.name for p in OUT.iterdir())))
