"""Contact sheet: python -I sheet.py <framesdir> <out.jpg> <start> <end> <step> <cols> <tilew>
Labels each tile with 30fps frame index and timestamp."""
import os
import sys

from PIL import Image, ImageDraw

d, out, s, e, step, cols, tw = sys.argv[1], sys.argv[2], *map(int, sys.argv[3:8])
files = sorted(os.listdir(d))
idx = [i for i in range(s, min(e, len(files)), step)]
th = int(tw * 16 / 9)
rows = (len(idx) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * (th + 14)), (20, 20, 20))
dr = ImageDraw.Draw(sheet)
for k, i in enumerate(idx):
    im = Image.open(os.path.join(d, files[i])).convert("RGB").resize((tw, th), Image.LANCZOS)
    x, y = (k % cols) * tw, (k // cols) * (th + 14)
    sheet.paste(im, (x, y + 14))
    dr.text((x + 3, y + 1), f"#{i} {i/30:.2f}s", fill=(255, 255, 0))
sheet.save(out, quality=90)
print(out, len(idx))
