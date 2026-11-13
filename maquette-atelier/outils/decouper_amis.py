# Découpe chaque ami de la couverture originale « Christmas Crafts » avec SAM (points positifs/négatifs),
# puis ajoute un bord blanc « papier découpé ». Coordonnées en px de l'image 1792 × 2400.
import sys, json, numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session
from scipy import ndimage as ndi
SRC, OUT = sys.argv[1], sys.argv[2]
im = Image.open(SRC).convert('RGB')
k = 1 / 0.41667
A = {  # nom: (boîte x0,y0,x1,y1 en px affichés, points positifs, points négatifs) — coordonnées « affichage 746 px »
 'renard':       ((20, 425, 250, 700), [(160, 520), (110, 470), (60, 620), (190, 600)], [(120, 660), (230, 615)]),
 'renard-blanc': ((5, 590, 205, 815), [(130, 670), (110, 760), (40, 740)], [(160, 520), (200, 700)]),
 'faon':         ((535, 430, 705, 645), [(600, 540), (615, 600), (585, 470)], [(520, 600), (700, 520), (640, 640)]),
 'lapin':        ((465, 505, 565, 665), [(515, 590), (505, 530), (500, 640)], [(470, 650), (560, 620)]),
 'ours':         ((570, 595, 745, 835), [(660, 680), (680, 770), (620, 790)], [(580, 830), (720, 830)]),
 'herisson':     ((100, 770, 240, 920), [(170, 850), (130, 830), (215, 880)], [(250, 870)]),
 'grenouille':   ((240, 815, 325, 920), [(280, 850), (285, 895)], [(335, 870), (230, 880)]),
 'pingouin':     ((320, 770, 435, 930), [(375, 840), (380, 900), (400, 800)], [(310, 900), (445, 880)]),
 'phoque':       ((440, 780, 705, 940), [(560, 840), (520, 820), (650, 880)], [(500, 935), (610, 935)]),
}
sess = new_session('sam')
meta = {}
for nom, (bx, pos, neg) in A.items():
    x0, y0, x1, y1 = [int(v * k) for v in bx]
    crop = im.crop((x0, y0, x1, y1))
    prompt = [{'type': 'point', 'data': [int(px * k) - x0, int(py * k) - y0], 'label': 1} for px, py in pos] + \
             [{'type': 'point', 'data': [int(px * k) - x0, int(py * k) - y0], 'label': 0} for px, py in neg]
    m = remove(crop, session=sess, sam_prompt=prompt, only_mask=True)
    a = np.array(m) > 127
    lab, n = ndi.label(a)
    if n > 1:  # garde la composante qui contient le premier point positif (sinon la plus grande)
        px, py = int(pos[0][0] * k) - x0, int(pos[0][1] * k) - y0
        keep = lab[py, px] or (np.bincount(lab.ravel())[1:].argmax() + 1)
        a = lab == keep
    a = ndi.binary_fill_holes(a)
    bord = ndi.binary_dilation(a, iterations=14)               # bord blanc papier
    rgba = np.zeros((a.shape[0], a.shape[1], 4), np.uint8)
    c = np.array(crop)
    rgba[bord] = [255, 255, 255, 255]
    rgba[a, :3] = c[a]; rgba[a, 3] = 255
    out = Image.fromarray(rgba).filter(ImageFilter.SMOOTH)
    bb = out.getbbox(); out = out.crop(bb)
    out.save(f'{OUT}/{nom}.png'); meta[nom] = out.size
    print(nom, out.size, 'surface', int(a.sum()))
json.dump(meta, open(f'{OUT}/tailles.json', 'w'))
