# Tracé de découpe (pointillés) : silhouette pleine du gabarit, dilatée jusqu'aux pointillés, contour simplifié.
import json, numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage import measure
W = 'D:/Builds-jeu/houlou-atelier/v2'
def contour(img, dil, n=220):
    L = np.asarray(img.convert('L')); m = L < 160
    m = ndi.binary_closing(m, iterations=dil); m = ndi.binary_fill_holes(m)
    lab, k = ndi.label(m); m = lab == (np.bincount(lab.ravel())[1:].argmax() + 1)
    cs = measure.find_contours(m.astype(float), 0.5); c = max(cs, key=len)
    idx = np.linspace(0, len(c) - 1, n).astype(int); c = c[idx]
    return [[round(float(x) / m.shape[1], 4), round(float(y) / m.shape[0], 4)] for y, x in c]
sapin = Image.open(W + '/data/sapin-page.jpg')
json.dump(contour(sapin, 6), open(W + '/data/sapin-coupe.json', 'w'))
# Étoile de Pip (page privée du livre) : on recadre l'étoile, on la colorie (étoile jaune, écharpe rouge) et on la découpe
p = Image.open(W + '/img-prive/crafts-p6.png').convert('RGB'); print('p6', p.size)
s = 900 / p.height
box = [int(v / s) for v in (70, 145, 565, 675)]
st = p.crop(box)
L = np.asarray(st.convert('L')); z, n = ndi.label(~ndi.binary_dilation(L < 140, iterations=1))
base0 = np.asarray(st).astype(float); col = base0.copy()
graines = [((300, 250), (246, 205, 58)), ((150, 470), (246, 205, 58)), ((480, 470), (246, 205, 58)), ((250, 620), (246, 205, 58)),
           ((300, 470), (220, 60, 60)), ((375, 515), (220, 60, 60)), ((262, 330), (90, 95, 110)), ((440, 445), (90, 95, 110)),
           ((205, 520), (90, 95, 110))]
for (gx, gy), c in graines:
    x, y = int(gx / s) - box[0], int(gy / s) - box[1]
    if 0 <= y < z.shape[0] and 0 <= x < z.shape[1] and z[y, x]:
        m = z == z[y, x]; col[m] = np.array(c) * (base0[m] / 255.0)
m = ndi.binary_fill_holes(ndi.binary_closing(L < 160, iterations=9))
lab, k = ndi.label(m); m = lab == (np.bincount(lab.ravel())[1:].argmax() + 1)
rgba = np.dstack([col.clip(0, 255).astype(np.uint8), (m * 255).astype(np.uint8)])
Image.fromarray(rgba).save(W + '/img-prive/etoile-pip.png'); print('étoile', st.size)
