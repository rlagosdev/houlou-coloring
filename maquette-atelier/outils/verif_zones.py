import json, sys, numpy as np
from PIL import Image
W = 'D:/Builds-jeu/houlou-atelier/v2/data/'
out = []
for nom in sys.argv[1:]:
    b = np.asarray(Image.open(W + nom + '-page.jpg').convert('RGB')).astype(float)
    z = np.asarray(Image.open(W + nom + '-zones.png').convert('RGB')).astype(int); z = z[..., 0] + 256 * z[..., 1]
    R = json.load(open(W + nom + '.json'))
    col = b.copy()
    for j, r in enumerate(R, 1):
        c = np.array([int(r['c'][i:i + 2], 16) for i in (1, 3, 5)], float)
        m = z == j; col[m] = c * (b[m] / 255.0)
    im = Image.fromarray(col.clip(0, 255).astype(np.uint8)); im.thumbnail((400, 600)); out.append(im)
T = Image.new('RGB', (400 * len(out), 600), 'white')
for i, im in enumerate(out): T.paste(im, (i * 400, 0))
T.save('D:/Builds-jeu/houlou-atelier/v2/verif-zones.jpg')
