// Vers la boutique (10/11/2026).
// 1. Le lien « 🦉 Houlou » en haut des pages produit devient un vrai bouton « Voir toute la boutique → ».
// 2. Si le client s'apprête à quitter la page (souris qui sort par le haut sur ordinateur,
//    remontée rapide sur téléphone), une fenêtre l'invite une fois à voir toute la boutique.
(function () {
  var FR = /^fr/i.test(document.documentElement.lang || '') || location.pathname.indexOf('/fr/') === 0;
  function t(en, fr) { return FR ? fr : en; }
  function track(n, d) { try { window.umami && window.umami.track(n, d || {}); } catch (e) {} }
  var ACCUEIL = location.origin + '/';
  var debut = Date.now(), achat = false;

  var css = document.createElement('style');
  css.textContent =
    '.vb-lien{display:inline-flex!important;align-items:center;gap:6px;background:#ffcc33;color:#111!important;text-decoration:none!important;' +
      'border-radius:999px;padding:7px 14px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,.15)}' +
    '.vb-lien small{font-weight:700;font-size:.85em}' +
    '.vb-fond{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.vb-carte{background:#fff;border-radius:18px;max-width:340px;width:100%;padding:24px 20px;text-align:center;font-family:system-ui,sans-serif;position:relative}' +
    '.vb-carte h3{margin:0 0 6px;font-size:21px;color:#111}.vb-carte p{margin:0 0 16px;color:#444;font-size:15px}' +
    '.vb-go{display:block;background:#111;color:#fff!important;text-decoration:none;border-radius:999px;padding:13px;font-weight:800;font-size:16px}' +
    '.vb-non{margin-top:10px;background:none;border:0;color:#888;font-size:13px;cursor:pointer}' +
    '.vb-x{position:absolute;top:6px;right:12px;border:0;background:none;font-size:24px;color:#888;cursor:pointer}';
  document.head.appendChild(css);

  function poser() {
    // 1. Lien d'en-tête
    document.querySelectorAll('a').forEach(function (a) {
      if (/^\s*🦉\s*Houlou\s*$/.test(a.textContent) && a.href === ACCUEIL) {
        a.classList.add('vb-lien');
        a.innerHTML = '🦉 Houlou <small>· ' + t('See the whole shop →', 'Voir toute la boutique →') + '</small>';
        a.addEventListener('click', function () { track('vers-boutique', { origine: 'entete' }); });
      }
    });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="buy.stripe.com/"]');
      if (a) achat = true;
    }, true);

    // 2. Invitation avant de partir (une fois par visite)
    function dejaVu() { try { return sessionStorage.getItem('vb-vu') === '1'; } catch (e) { return false; } }
    function inviter(raison) {
      if (achat || dejaVu() || Date.now() - debut < 6000 || document.querySelector('.vb-fond')) return;
      try { sessionStorage.setItem('vb-vu', '1'); } catch (e) {}
      track('vers-boutique-invitation', { raison: raison });
      var fond = document.createElement('div');
      fond.className = 'vb-fond';
      fond.innerHTML =
        '<div class="vb-carte"><button class="vb-x" aria-label="Close">×</button>' +
        '<div style="font-size:44px">🦉</div>' +
        '<h3>' + t('Wait, before you go!', 'Attendez, avant de partir !') + '</h3>' +
        '<p>' + t('Houlou has a whole shop: coloring books, Christmas packs, T-shirts, posters and gifts.',
                  'Houlou a toute une boutique : livres de coloriage, packs de Noël, t-shirts, posters et cadeaux.') + '</p>' +
        '<a class="vb-go" href="' + ACCUEIL + '">' + t('See the whole shop →', 'Voir toute la boutique →') + '</a>' +
        '<button class="vb-non">' + t('No thanks', 'Non merci') + '</button></div>';
      document.body.appendChild(fond);
      function fermer() { fond.remove(); }
      fond.addEventListener('click', function (e) { if (e.target === fond) fermer(); });
      fond.querySelector('.vb-x').addEventListener('click', fermer);
      fond.querySelector('.vb-non').addEventListener('click', fermer);
      fond.querySelector('.vb-go').addEventListener('click', function () { track('vers-boutique', { origine: 'invitation' }); });
    }
    // ?invitation : pour voir la fenêtre tout de suite (vérification)
    if (/[?&]invitation\b/.test(location.search)) { debut = 0; try { sessionStorage.removeItem('vb-vu'); } catch (e) {} setTimeout(function () { inviter('test'); }, 800); }
    // Ordinateur : la souris sort par le haut de la fenêtre (vers les onglets / la croix)
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0) inviter('souris'); });
    // Téléphone : remontée rapide vers le haut (geste typique avant de quitter)
    var hist = [], maxY = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY, now = Date.now(), haut = y;
      maxY = Math.max(maxY, y);
      hist.push([now, y]);
      while (hist.length && now - hist[0][0] > 600) hist.shift();
      hist.forEach(function (h) { if (h[1] > haut) haut = h[1]; });
      if (maxY > 600 && haut - y > 300 && y < 500) inviter('remontee');
    }, { passive: true });
  }
  if (document.body) poser(); else document.addEventListener('DOMContentLoaded', poser);
})();
