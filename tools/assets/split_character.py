"""Split the front-view figure of character-sheet-02 into head and body layers.

Both layers keep the same 252x680 canvas so they line up with no offsets.
Sources are never modified; outputs go to public/assets/characters/animation-parts/.
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2] / "public" / "assets" / "characters"
SHEET = ROOT / "character-sheets" / "character-sheet-02-transparent-background.png"

X0, Y0, X1, Y1 = 20, 0, 272, 680  # front figure on the sheet
CUT = 92  # above the hoodie collar
NECK = (119, 92, 168, 114)  # sheet coords: neck strip kept with the head (x0, y0, x1, y1)
NECK_HOLE = 100  # the body has no neck above this y inside the strip, so no second chin line shows
FADE = 14  # head neck fades out over the last rows, blending into the body

sheet = Image.open(SHEET).convert("RGBA")
fig = sheet.crop((X0, Y0, X1, Y1))
w, h = fig.size

# Head mask: everything above CUT plus the neck strip, with a soft bottom edge.
mask = Image.new("L", (w, h), 0)
d = ImageDraw.Draw(mask)
d.rectangle((0, 0, w, CUT - 1), fill=255)
nx0, ny0, nx1, ny1 = NECK[0] - X0, NECK[1], NECK[2] - X0, NECK[3]
d.rectangle((nx0, ny0, nx1, ny1 - 1), fill=255)
for i, y in enumerate(range(ny1 - FADE, ny1)):
    d.rectangle((nx0, y, nx1, y), fill=int(255 * (1 - (i + 1) / (FADE + 1))))

head = fig.copy()
head.putalpha(Image.composite(fig.getchannel("A"), Image.new("L", (w, h), 0), mask))

body = fig.copy()
body_alpha = fig.getchannel("A").copy()
bd = ImageDraw.Draw(body_alpha)
bd.rectangle((0, 0, w, CUT - 1), fill=0)
bd.rectangle((nx0, CUT, nx1, NECK_HOLE - 1), fill=0)
body.putalpha(body_alpha)

(ROOT / "animation-parts/head").mkdir(parents=True, exist_ok=True)
(ROOT / "animation-parts/torso").mkdir(parents=True, exist_ok=True)
head.save(ROOT / "animation-parts/head/head-front-neutral.png")
body.save(ROOT / "animation-parts/torso/body-front-no-head.png")

# Skin tone sampled from the cheek, used for the eyelids.
px = [fig.getpixel((x, y)) for x in range(105, 112) for y in range(68, 72)]
print("skin", tuple(sum(c[i] for c in px) // len(px) for i in range(3)), "size", fig.size)
