"""Build sad and thoughtful head layers from the head portraits on character-sheet-02.

Each portrait is scaled and placed so its ears line up with the neutral head, then masked the same
way as the neutral head (see split_character.py), so all three heads share the 252x680 canvas and
the same neck seam. Sources are not modified.
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2] / "public" / "assets" / "characters"
sheet = Image.open(ROOT / "character-sheets" / "character-sheet-02-transparent-background.png").convert("RGBA")

W, H = 252, 680
CUT, NECK_Y1, FADE = 92, 114, 14
NECK_X0, NECK_X1 = 119 - 20, 168 - 20  # strip in canvas coords
EAR_C = (125, 65)  # ear center of the neutral head, canvas coords
EAR_W = 68  # ear-to-ear width of the neutral head, canvas px

# Extra regions (canvas coords) to clear: the sad portrait's hoodie collar would float above the real one.
ERASE = {"sad": [(0, 76, NECK_X0 - 1, H), (NECK_X1 + 1, 76, W, H)]}
# Dark collar slivers inside the neck strip edges (x ranges, y range): only dark pixels are cleared.
ERASE_DARK = {"sad": [(NECK_X0, 76, 103, CUT + 8), (145, 76, NECK_X1, CUT + 8)]}

# name: (crop box on sheet, ear center on sheet, ear-to-ear width on sheet)
PORTRAITS = {
    "sad": ((633, 242, 820, 455), (727, 355), 125),
    "thoughtful": ((1198, 242, 1368, 465), (1277, 360), 120),
}


def head_mask() -> Image.Image:
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    d.rectangle((0, 0, W, CUT - 1), fill=255)
    d.rectangle((NECK_X0, CUT, NECK_X1, NECK_Y1 - 1), fill=255)
    for i, y in enumerate(range(NECK_Y1 - FADE, NECK_Y1)):
        d.rectangle((NECK_X0, y, NECK_X1, y), fill=int(255 * (1 - (i + 1) / (FADE + 1))))
    return m


def build(name: str, box, ear, ear_w):
    s = EAR_W / ear_w
    crop = sheet.crop(box)
    crop = crop.resize((round(crop.width * s), round(crop.height * s)), Image.LANCZOS)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ox = round(EAR_C[0] - (ear[0] - box[0]) * s)
    oy = round(EAR_C[1] - (ear[1] - box[1]) * s)
    layer.alpha_composite(crop, (max(0, ox), max(0, oy)), (max(0, -ox), max(0, -oy))) if ox < 0 or oy < 0 else layer.alpha_composite(crop, (ox, oy))
    for rect in ERASE.get(name, []):
        ImageDraw.Draw(layer).rectangle(rect, fill=(0, 0, 0, 0))
    for x0, y0, x1, y1 in ERASE_DARK.get(name, []):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                r, g, b, a = layer.getpixel((x, y))
                if a and max(r, g, b) < 95:
                    layer.putpixel((x, y), (0, 0, 0, 0))
    layer.putalpha(Image.composite(layer.getchannel("A"), Image.new("L", (W, H), 0), head_mask()))
    out = ROOT / "animation-parts" / "head" / f"head-front-{name}.png"
    layer.save(out)
    print(name, "scale", round(s, 3), "offset", (ox, oy))
    return s, ox, oy


if __name__ == "__main__":
    for n, (b, e, w) in PORTRAITS.items():
        build(n, b, e, w)
