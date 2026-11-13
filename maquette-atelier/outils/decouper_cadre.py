# Découpe SAM avec un cadre serré (+ points) pour les amis dont le corps manquait. Coordonnées « affichage 746 px ».
import sys, numpy as np
from PIL import Image, ImageFilter, ImageDraw
from rembg import remove, new_session
from scipy import ndimage as ndi
SRC, OUT = sys.argv[1], sys.argv[2]
im = Image.open(SRC).convert('RGB'); k = 1 / 0.41667
A = {  # nom: marge de recadrage, cadre serré du personnage, points positifs, points négatifs
 'faon':     ((530, 425, 710, 650), (545, 435, 690, 640), [(600, 535), (600, 600)], [(670, 640)]),
}
sess = new_session('sam')
for nom, (bx, cadre, pos, neg) in A.items():
    x0, y0, x1, y1 = [int(v * k) for v in bx]; crop = im.crop((x0, y0, x1, y1))
    c = [int(cadre[0] * k) - x0, int(cadre[1] * k) - y0, int(cadre[2] * k) - x0, int(cadre[3] * k) - y0]
    prompt = [{'type': 'rectangle', 'data': c, 'label': 1}] + \
             [{'type': 'point', 'data': [int(px * k) - x0, int(py * k) - y0], 'label': 1} for px, py in pos] + \
             [{'type': 'point', 'data': [int(px * k) - x0, int(py * k) - y0], 'label': 0} for px, py in neg]
    a = np.array(remove(crop, session=sess, sam_prompt=prompt, only_mask=True)) > 127
    a = ndi.binary_fill_holes(a)
    if nom == 'faon':  # retire les bouts de sapin (vert) et de mur collés au bas du corps
        cc0 = np.array(crop).astype(int); vert = (cc0[..., 1] > cc0[..., 0] + 15) & (cc0[..., 1] > cc0[..., 2] + 10)
        a &= ~ndi.binary_dilation(vert, iterations=3); a = ndi.binary_opening(a, iterations=7)
    lab, n = ndi.label(a)
    if n > 1: a = lab == (np.bincount(lab.ravel())[1:].argmax() + 1)
    bord = ndi.binary_dilation(a, iterations=14)
    rgba = np.zeros((a.shape[0], a.shape[1], 4), np.uint8); cc = np.array(crop)
    rgba[bord] = [255, 255, 255, 255]; rgba[a, :3] = cc[a]; rgba[a, 3] = 255
    out = Image.fromarray(rgba).filter(ImageFilter.SMOOTH); out = out.crop(out.getbbox()); out.save(f'{OUT}/{nom}.png'); print(nom, out.size, int(a.sum()))
