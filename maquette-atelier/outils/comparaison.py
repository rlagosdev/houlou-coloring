# Planche « vraie page du livre ↔ capture de l'animation » + planche finale (ordinateur et téléphone).
import sys
from PIL import Image, ImageDraw, ImageFont
CAP = sys.argv[1]; OUT = sys.argv[2]
V = 'D:/Builds-jeu/houlou-atelier/v2/'
F = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 22); f2 = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 18)
L = [('Coloring Book — « Goodnight, Houlou »', V + 'data/coloriage-page.jpg', '01-coloriage'),
     ('Mystery Pictures — image 1 (page privée)', V + 'data/mystere-page.jpg', '02-mystere'),
     ('Math — « Count from 1 to 5 » / « Adding up to 5 »', V + 'img/livres/adding.jpg', '03-math'),
     ('Seek & Find — « At the funfair » (7 différences)', V + 'img/livres/differences.jpg', '04-seek'),
     ('Phonics — fiche « qu »', V + 'img/livres/sheet-qu.jpg', '05-phonics'),
     ('Writing Club — « Back to school »', V + 'img/livres/sheet-opinion.jpg', '06-writing'),
     ('Christmas Crafts — « Houlou’s Little Tree »', V + 'data/sapin-page.jpg', '07-crafts'),
     ('Advent Calendar — « My Advent Calendar »', V + 'data/calendrier-page.jpg', '08-advent')]
H = 360; rows = []
for titre, page, cap in L:
    pg = Image.open(page).convert('RGB'); pg.thumbnail((260, H))
    mi = Image.open(f'{CAP}/ordi-{cap}-mi.png').convert('RGB').resize((576, H))
    fi = Image.open(f'{CAP}/ordi-{cap}-fin.png').convert('RGB').resize((576, H))
    r = Image.new('RGB', (260 + 576 * 2 + 40, H + 40), 'white'); d = ImageDraw.Draw(r)
    r.paste(pg, (0, 36)); r.paste(mi, (280, 36)); r.paste(fi, (280 + 576 + 20, 36))
    d.text((0, 6), titre + '   ·   vraie page | animation à mi-parcours | animation finie', fill='black', font=F); rows.append(r)
W = Image.new('RGB', (rows[0].width, sum(r.height for r in rows)), 'white'); y = 0
for r in rows: W.paste(r, (0, y)); y += r.height
W.save(OUT + '/comparaison-vraie-page-animation.jpg', quality=85)
print('ok')
