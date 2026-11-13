import glob, os
from PIL import Image, ImageDraw, ImageFont
F = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 18)
for dev, (w, h), cols in (('ordi', (480, 300), 4), ('tel', (195, 422), 9)):
    fs = sorted(glob.glob(f'D:/Builds-jeu/houlou-atelier/captures/final/{dev}-*.png'))
    rows = (len(fs) + cols - 1) // cols; W = Image.new('RGB', (cols * w, rows * (h + 24)), 'white'); d = ImageDraw.Draw(W)
    for i, f in enumerate(fs):
        x, y = (i % cols) * w, (i // cols) * (h + 24); W.paste(Image.open(f).convert('RGB').resize((w, h)), (x, y))
        d.text((x + 4, y + h + 2), os.path.basename(f)[:-4], fill='black', font=F)
    W.save(f'D:/Builds-jeu/houlou-atelier/v2/planches/planche-finale-{dev}.jpg', quality=85); print(dev, len(fs))
