# Variante : union de plusieurs passes SAM (une par point positif, avec les points négatifs), pour les amis
# dont une seule passe ne garde que la tête.
import sys, numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session
from scipy import ndimage as ndi
SRC, OUT = sys.argv[1], sys.argv[2]
im = Image.open(SRC).convert('RGB'); k = 1 / 0.41667
A = {
 'renard':   ((15, 420, 250, 705), [(160, 515), (175, 610), (215, 600), (60, 640), (100, 560), (225, 620)], [(120, 665), (200, 700), (40, 720)]),
 'faon':     ((535, 430, 705, 645), [(600, 530), (595, 600), (620, 590), (580, 470)], [(520, 640), (700, 520), (660, 640), (560, 650)]),
 'pingouin': ((320, 770, 440, 930), [(375, 820), (360, 880), (395, 885), (378, 915), (350, 850)], [(310, 900), (450, 880), (300, 830)]),
}
sess = new_session('sam')
for nom, (bx, pos, neg) in A.items():
    x0, y0, x1, y1 = [int(v * k) for v in bx]; crop = im.crop((x0, y0, x1, y1))
    P = lambda pts, l: [{'type': 'point', 'data': [int(px * k) - x0, int(py * k) - y0], 'label': l} for px, py in pts]
    a = np.zeros((y1 - y0, x1 - x0), bool)
    for p in pos:
        m = np.array(remove(crop, session=sess, sam_prompt=P([p], 1) + P(neg, 0), only_mask=True)) > 127
        lab, n = ndi.label(m); px, py = int(p[0] * k) - x0, int(p[1] * k) - y0
        if n and lab[py, px]: m = lab == lab[py, px]
        if m.sum() < 0.6 * m.size: a |= m          # ignore une passe qui prend tout le fond
    a = ndi.binary_opening(ndi.binary_fill_holes(ndi.binary_closing(a, iterations=4)), iterations=2)
    lab, n = ndi.label(a); a = lab == (np.bincount(lab.ravel())[1:].argmax() + 1)
    bord = ndi.binary_dilation(a, iterations=14)
    rgba = np.zeros((a.shape[0], a.shape[1], 4), np.uint8); c = np.array(crop)
    rgba[bord] = [255, 255, 255, 255]; rgba[a, :3] = c[a]; rgba[a, 3] = 255
    out = Image.fromarray(rgba).filter(ImageFilter.SMOOTH); out = out.crop(out.getbbox()); out.save(f'{OUT}/{nom}.png'); print(nom, out.size, int(a.sum()))
