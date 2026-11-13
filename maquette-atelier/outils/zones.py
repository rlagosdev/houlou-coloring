# Prépare, pour chaque page à colorier, une carte des zones (PNG, id = R + 256·G) et la liste ordonnée des zones
# avec leur couleur : vraies pages des livres uniquement ; les couleurs viennent de la version coloriée du livre quand
# elle existe (page gratuite, Mystery Pictures), sinon de points-graines choisis à la main (gabarit du sapin, calendrier).
import json, sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
W = 'D:/Builds-jeu/houlou-atelier/v2'
SITE = 'C:/Users/Shadow/Projets/houlou-coloring'
SRC = 'C:/Users/Shadow/Projets/chaines-ops-rangement/sites/houlou-coloring'
PAL = [(250, 215, 50), (245, 140, 40), (220, 45, 45), (245, 165, 195), (120, 195, 240), (35, 70, 150), (70, 170, 70), (135, 85, 45)]

def zones(L, seuil=140, dil=1, aire_min=60):
    trait = ndi.binary_dilation(L < seuil, iterations=dil)
    z, n = ndi.label(~trait)
    aires = np.bincount(z.ravel(), minlength=n + 1)
    return z, n, aires, trait

def sauver(nom, base, z, regs):
    # carte : on renumérote les zones retenues 1..k dans l'ordre
    carte = np.zeros(z.shape, np.int32)
    out = []
    for j, r in enumerate(regs, start=1):
        carte[z == r['z']] = j
        out.append({k: v for k, v in r.items() if k != 'z'})
    rgb = np.zeros(z.shape + (3,), np.uint8); rgb[..., 0] = carte % 256; rgb[..., 1] = carte // 256
    Image.fromarray(rgb).save(f'{W}/data/{nom}-zones.png')
    base.save(f'{W}/data/{nom}-page.jpg', quality=90)
    json.dump(out, open(f'{W}/data/{nom}.json', 'w'))
    print(nom, base.size, len(out), 'zones')

def depuis_couleur(nom, f_ligne, f_coul, largeur=600, haut=None, ordre='couleur', palette=None, base_img=None):
    li = Image.open(f_ligne).convert('L'); co = Image.open(f_coul).convert('RGB')
    if haut: li = li.crop((0, 0, li.width, haut))
    h = round(li.height * largeur / li.width)
    li = li.resize((largeur, h), Image.LANCZOS); co = co.resize((largeur, h), Image.LANCZOS)
    L = np.asarray(li); C = np.asarray(co).astype(int)
    z, n, aires, trait = zones(L)
    regs = []
    for k, sl in enumerate(ndi.find_objects(z), start=1):
        if sl is None or aires[k] < 60 or aires[k] > 0.5 * z.size and False: continue
        m = z[sl] == k
        er = ndi.binary_erosion(m, iterations=2)
        pix = C[sl][er if er.sum() > 10 else m]
        med = np.median(pix, axis=0)
        if med.min() > 235: continue                                  # zone laissée blanche dans la version coloriée
        if palette:
            i = int(np.argmin(((np.array(palette) - med) ** 2).sum(1))); c = palette[i]; num = i + 1
        else:
            c = [int(v) for v in med]; num = 0
        ys, xs = np.nonzero(m)
        regs.append({'z': k, 'c': '#%02x%02x%02x' % tuple(c), 'n': num, 'x': round(float(xs.mean() + sl[1].start) / largeur, 4),
                     'y': round(float(ys.mean() + sl[0].start) / h, 4), 'a': int(aires[k])})
    if ordre == 'numero':
        regs.sort(key=lambda r: (r['n'], r['y'], r['x']))
    else:   # par couleur (le crayon change de couleur d'un groupe à l'autre), du plus grand groupe au plus petit, haut → bas
        grp = {}
        for r in regs: grp.setdefault(r['c'], []).append(r)
        regs = []
        for c, rs in sorted(grp.items(), key=lambda kv: -sum(r['a'] for r in kv[1])):
            regs += sorted(rs, key=lambda r: (r['y'], r['x']))
    base = (base_img or li.convert('RGB'))
    if base_img: base = base_img.resize((largeur, round(base_img.height * largeur / base_img.width)), Image.LANCZOS)
    sauver(nom, base, z, regs)

def depuis_graines(nom, f, graines, largeur=600, seuil=140):
    im = Image.open(f).convert('RGB'); h = round(im.height * largeur / im.width); im = im.resize((largeur, h), Image.LANCZOS)
    L = np.asarray(im.convert('L')); z, n, aires, trait = zones(L, seuil)
    regs, vus = [], set()
    for (gx, gy, c) in graines:           # gx, gy : fractions de la page
        x, y = int(gx * largeur), int(gy * h)
        k = int(z[y, x])
        if not k or k in vus:
            continue
        vus.add(k); ys, xs = np.nonzero(z == k)
        regs.append({'z': k, 'c': c, 'n': 0, 'x': round(float(xs.mean()) / largeur, 4), 'y': round(float(ys.mean()) / h, 4), 'a': int(aires[k])})
    sauver(nom, im, z, regs)

# 1. Coloring Book — page gratuite « Goodnight, Houlou » (trait + version coloriée du livre)
M = 'G:/Mon Drive/Houlou – 3D/maquette-atelier-noel/img/'
depuis_couleur('coloriage', M + 'line.jpg', M + 'colored.jpg')
# 2. Mystery Pictures — image 1 (trait, solution du livre ; la vraie page numérotée sert de fond, légende comprise)
MY = SRC + '/mystere/'
page = Image.open(MY + 'pages/mystere-01.png').convert('RGB')
depuis_couleur('mystere', MY + 'lineart/lineart-01.png', MY + 'solutions/solution-01.jpg', ordre='numero', palette=PAL)
# la carte ne couvre que le dessin (2400 px) : on ajoute la bande de légende à la base, sans zones
ref = Image.open(W + '/data/mystere-page.jpg'); zz = np.asarray(Image.open(W + '/data/mystere-zones.png'))
H2 = round(page.height * 600 / page.width); pg = page.resize((600, H2), Image.LANCZOS); pg.save(W + '/data/mystere-page.jpg', quality=90)
z2 = np.zeros((H2, 600, 3), np.uint8); z2[:zz.shape[0]] = zz; Image.fromarray(z2).save(W + '/data/mystere-zones.png')

# 3. Christmas Crafts — « Houlou's Little Tree » (vraie page du site) : couleurs posées par graines (fractions de la page)
G, R_, Y, B, BR, BE, W_ = '#4caf50', '#e04a4a', '#f6d23a', '#5aa9e6', '#8a5a36', '#f3dcb8', '#f4efe6'
fx = lambda x, y, c: (x / 672, y / 900, c)
depuis_graines('sapin', SITE + '/christmas-crafts/tree.jpg', [
    fx(330, 150, G), fx(250, 345, G), fx(330, 470, G), fx(220, 600, G), fx(420, 600, G), fx(450, 330, G), fx(560, 600, G),
    fx(272, 228, R_), fx(404, 228, Y), fx(205, 390, B), fx(350, 420, R_), fx(473, 383, Y), fx(150, 550, Y), fx(335, 592, B), fx(514, 540, R_),
    fx(330, 760, BR), fx(300, 700, BR), fx(520, 650, B), fx(560, 700, B), fx(470, 760, BR), fx(440, 790, BR), fx(235, 745, W_), fx(575, 768, W_)])
# 4. Advent Calendar — page « My Advent Calendar » : chaque jour, le dessin de sa case se colorie
ic = [('#f6d23a', 125, 172), ('#e04a4a', 262, 178), ('#5aa9e6', 405, 188), ('#8fd0f5', 545, 150), ('#f6d23a', 125, 305), ('#e04a4a', 262, 268),
      ('#6cc070', 405, 300), ('#e04a4a', 545, 312), ('#4caf50', 125, 422), ('#b5763a', 262, 425), ('#e04a4a', 400, 415), ('#4caf50', 528, 400)]
gr = []
for d in range(24):
    c, x, y = ic[d % 12]; y += (372 if d >= 12 else 0)
    gr.append((x / 636, y / 900, c))
depuis_graines('calendrier', SITE + '/advent/calendar.jpg', gr)

# 4 bis. Calendrier : toutes les zones du dessin de chaque case (sauf le fond de la case), dans l'ordre des jours
im = Image.open(SITE + '/advent/calendar.jpg').convert('RGB'); h = round(im.height * 600 / im.width); im = im.resize((600, h), Image.LANCZOS)
L = np.asarray(im.convert('L')); z, n, aires, trait = zones(L, 150)
cols = [(42, 172), (182, 312), (322, 452), (462, 594)]; rows = [(108, 222), (232, 346), (355, 470), (479, 593), (603, 717), (727, 842)]
sx, sy = 600 / 636, h / 900
cent = ndi.center_of_mass(np.ones_like(z), z, range(n + 1))
regs = []
for d in range(24):
    (x0, x1), (y0, y1) = cols[d % 4], rows[d // 4]
    x0, x1, y0, y1 = x0 * sx, x1 * sx, y0 * sy, y1 * sy
    aire_case = (x1 - x0) * (y1 - y0)
    c = ic[d % 12][0]
    for k in range(1, n + 1):
        cy, cx = cent[k]
        if not (x0 + 6 < cx < x1 - 6 and y0 + 6 < cy < y1 - 6): continue
        if aires[k] < 25 or aires[k] > 0.45 * aire_case: continue
        regs.append({'z': k, 'c': c, 'n': d + 1, 'x': round(cx / 600, 4), 'y': round(cy / h, 4), 'a': int(aires[k])})
sauver('calendrier', im, z, regs)
