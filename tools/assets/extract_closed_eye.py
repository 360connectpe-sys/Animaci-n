"""Extract the closed-eye close-up from character-sheet-02 as a soft-edged overlay.

The sheet's close-up is the character's right eye (inner corner on the left); the left eye is
the same piece mirrored in code. Skin tone is matched to the head layer. Output is 4x the
canvas pixel size of the figure (252x680 canvas) so it stays sharp when scaled up.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageStat

ROOT = Path(__file__).resolve().parents[2] / "public" / "assets" / "characters"
sheet = Image.open(ROOT / "character-sheets" / "character-sheet-02-transparent-background.png").convert("RGBA")
head = Image.open(ROOT / "animation-parts" / "head" / "head-front-neutral.png").convert("RGBA")

# Crop around the closed eye (sheet coords), centered on the lash line.
BOX = (1388, 224, 1508, 288)  # 120x64
PATCH = (1450, 275, 1480, 287)  # skin below the lashes, inside the crop
OUT_W = 60  # 120 sheet px -> 15 canvas px at 4x

crop = sheet.crop(BOX).convert("RGB")

# Match skin tone to the figure's cheek (head layer, canvas coords).
cheek = head.crop((106, 66, 120, 70))
fig = [v for v, a in zip(ImageStat.Stat(cheek.convert("RGB")).mean, (1, 1, 1))]
src = ImageStat.Stat(crop.crop((PATCH[0] - BOX[0], PATCH[1] - BOX[1], PATCH[2] - BOX[0], PATCH[3] - BOX[1]))).mean
gain = [f / s for f, s in zip(fig, src)]
bands = [crop.getchannel(i).point(lambda v, g=gain[i]: min(255, int(v * g))) for i in range(3)]
crop = Image.merge("RGB", bands)

out_h = round(crop.height * OUT_W / crop.width)
crop = crop.resize((OUT_W, out_h), Image.LANCZOS)

# Soft elliptical alpha so the patch melts into the surrounding skin.
mask = Image.new("L", crop.size, 0)
w, h = crop.size
ImageDraw.Draw(mask).ellipse((w * 0.04, h * 0.06, w * 0.96, h * 0.94), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(3.5))
crop.putalpha(mask)

(ROOT / "animation-parts" / "eyes").mkdir(parents=True, exist_ok=True)
crop.save(ROOT / "animation-parts" / "eyes" / "eye-closed-right.png")
print("gain", [round(g, 2) for g in gain], "size", crop.size)
