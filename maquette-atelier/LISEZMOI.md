# Maquette « l’atelier de Houlou » — v2 (13/11/2026)

Maquette privée, **non publiée** sur coloring.houlou.fr. Une page qui défile : autour de la même table, chaque livre a sa
vraie page et une animation fidèle à ce que l’enfant fait dans ce livre. L’animation avance avec le défilement et recule
quand on remonte (elle ne dépend pas du nombre d’images par seconde).

## Ouvrir la maquette

Elle charge des fichiers (modèle 3D, pages) : il faut un petit serveur local, pas un double-clic.

    cd maquette-atelier-v2
    python -m http.server 8765
    puis http://127.0.0.1:8765/index.html

## Écrans

1. Accueil — la pièce, Houlou sur son pouf, les amis qui se déplient comme un livre pop-up.
2. Coloring Book / Big Adventures / Happy Holidays / Winter Album — la page « Goodnight, Houlou » se colorie zone par zone
   (couleurs de la version coloriée du livre), le crayon change de couleur ; à côté, une vraie page de chacun des 3 autres livres.
3. Mystery Pictures — image 1 : toutes les zones du 1, puis du 2… avec la couleur de la légende (encadrée en rouge).
4. Math with Houlou — « Count from 1 to 5 » : le hérisson touche chaque objet, le chiffre s’affiche, le total s’écrit ;
   puis « Adding up to 5 » : les deux groupes se rejoignent et le résultat s’écrit dans la case.
5. Seek & Find — la loupe trouve les 3 clés, 2 cloches et 2 moufles (positions de la solution du livre), la liste se colorie ;
   puis les 7 différences de « At the funfair » sont entourées sur les deux images en même temps.
6. Phonics — la pastille « qu » sort de la fiche et se pose dans « quilt », « qu » est entouré dans les 6 mots, puis chaque
   mot est relié à son image.
7. Writing Club — « Back to school » : le prénom, puis de vraies phrases sur les lignes, puis la liste se coche.
8. Christmas Crafts — « Houlou’s Little Tree » se colorie, les ciseaux suivent les tirets, le sapin découpé s’accroche au grand
   sapin, l’étoile de Pip (vrai gabarit) va à la cime, le sapin s’allume.
9. Advent Calendar — la page calendrier se colorie jour par jour ; les vraies pages des jours 1, 6 et 9 se lèvent.
10. Boutique — Mega Pack (19,90 €), Christmas Crafts (3,90 €), Christmas Box (59,90 €), prix du site.

Houlou (vrai houlou.glb v5) tourne le corps vers l’action en cours et bat des ailes quand ça bouge. Un ami différent
participe à chaque activité ; les 9 amis ont été redécoupés dans la couverture originale « Christmas Crafts », avec un bord
blanc de papier.

## Fichiers privés (Drive et VM seulement, jamais dans GitHub)

- `houlou-glb.js` — le modèle 3D de Houlou ;
- `img-prive/` — pages des livres payants qui ne sont pas montrées sur le site (Big Adventures, Happy Holidays, étoile de
  Pip, solutions de Seek & Find) ;
- `data/mystere-*` — Mystery Pictures, image 1 et ses zones (page payante).

Sans eux, la maquette tourne quand même (sans Houlou, sans ces pages), et affiche un message.

## Outils

`outils/` : découpe des amis (SAM), cartes des zones à colorier, tracé de découpe, captures de contrôle (Playwright).
Liste des livres vérifiés : `LIVRES-VERIFIES.md`. Planches : `planches/`. Ratés pour le Journal : `rates/`.
