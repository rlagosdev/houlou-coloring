// Houlou à gratter — Black Friday 2026 (10/11/2026).
// Prix inchangés : la carte révèle un vrai code de −5 % (HOULOU5, Stripe, valable jusqu'au 30/11/2026).
// Une fois grattée, le code est pré-rempli dans tous les liens Stripe de la page.
(function () {
  var CODE = 'HOULOU5', FIN = new Date('2026-12-01T00:00:00+01:00');
  if (new Date() >= FIN) return;
  var FR = /^fr/i.test(document.documentElement.lang || '') || location.pathname.indexOf('/fr/') === 0;
  function t(en, fr) { return FR ? fr : en; }
  var gratte = false;
  try { gratte = localStorage.getItem('houlou-gratte') === '1'; } catch (e) {}

  function track(n, d) { try { window.umami && window.umami.track(n, d); } catch (e) {} }
  function prerempli() {
    document.querySelectorAll('a[href*="buy.stripe.com/"]').forEach(function (a) {
      if (a.href.indexOf('prefilled_promo_code') < 0) a.href += (a.href.indexOf('?') < 0 ? '?' : '&') + 'prefilled_promo_code=' + CODE;
    });
  }

  var css = document.createElement('style');
  css.textContent =
    '.hg-btn{position:fixed;right:16px;bottom:16px;z-index:9998;background:#111;color:#fff;border:0;border-radius:999px;padding:12px 18px;font:700 15px/1.2 system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25);cursor:pointer}' +
    '.hg-btn b{color:#ffcc33}' +
    '.hg-fond{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.hg-carte{background:#fff;border-radius:18px;max-width:360px;width:100%;padding:22px;text-align:center;font-family:system-ui,sans-serif;position:relative}' +
    '.hg-carte h3{margin:0 0 4px;font-size:20px}.hg-carte p{margin:6px 0;color:#444;font-size:14px}' +
    '.hg-zone{position:relative;width:280px;height:150px;margin:14px auto;border-radius:14px;overflow:hidden;background:#fff7d6;border:2px dashed #e0b400}' +
    '.hg-code{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:800}' +
    '.hg-code span{font-size:13px;color:#7a5b00}.hg-code strong{font-size:34px;letter-spacing:2px;color:#111}' +
    '.hg-zone canvas{position:absolute;inset:0;touch-action:none;cursor:grab}' +
    '.hg-x{position:absolute;top:8px;right:12px;border:0;background:none;font-size:22px;cursor:pointer;color:#666}' +
    '.hg-ok{display:none;margin-top:6px;background:#111;color:#fff;border:0;border-radius:10px;padding:10px 16px;font-weight:700;cursor:pointer}';
  document.head.appendChild(css);

  var btn = document.createElement('button');
  btn.className = 'hg-btn';
  btn.innerHTML = gratte ? t('🦉 Your code: <b>' + CODE + '</b> (−5%)', '🦉 Votre code : <b>' + CODE + '</b> (−5 %)') : t('🦉 Black Friday: <b>scratch Houlou</b> for a gift', '🦉 Black Friday : <b>grattez Houlou</b> pour un cadeau');
  btn.addEventListener('click', ouvrir);
  if (gratte) prerempli();

  function ouvrir() {
    track('grattage-ouvert', { deja: gratte ? 'oui' : 'non' });
    var fond = document.createElement('div');
    fond.className = 'hg-fond';
    fond.innerHTML =
      '<div class="hg-carte"><button class="hg-x" aria-label="Close">×</button>' +
      t('<h3>🖤 Black Friday at Houlou\'s</h3><p>Scratch the owl with your finger or mouse to reveal your gift.</p>', '<h3>🖤 Black Friday chez Houlou</h3><p>Grattez la chouette du doigt ou à la souris pour découvrir votre cadeau.</p>') +
      '<div class="hg-zone"><div class="hg-code">' + t('<span>5% off any Houlou product</span>', '<span>−5 % sur un produit Houlou</span>') + '<strong>' + CODE + '</strong>' + t('<span>applied automatically at checkout</span>', '<span>appliqué automatiquement au paiement</span>') + '</div><canvas width="280" height="150"></canvas></div>' +
      t('<p style="font-size:12px;color:#888">One use per order, until November 30, 2026.</p>', '<p style="font-size:12px;color:#888">Une fois par commande, jusqu\'au 30 novembre 2026.</p>') +
      t('<button class="hg-ok">Shop with my 5% off</button></div>', '<button class="hg-ok">J\'en profite</button></div>');
    document.body.appendChild(fond);
    function fermer() { fond.remove(); }
    fond.addEventListener('click', function (e) { if (e.target === fond) fermer(); });
    fond.querySelector('.hg-x').addEventListener('click', fermer);
    var ok = fond.querySelector('.hg-ok');
    ok.addEventListener('click', function () { track('grattage-achat', {}); fermer(); var a = document.querySelector('a[href*="buy.stripe.com/"]'); if (a) a.scrollIntoView({ behavior: 'smooth', block: 'center' }); });

    var cv = fond.querySelector('canvas'), cx = cv.getContext('2d');
    if (gratte) { cv.remove(); ok.style.display = 'inline-block'; return; }
    // Couche à gratter : une petite chouette Houlou dessinée
    cx.fillStyle = '#b9b9c3'; cx.fillRect(0, 0, 280, 150);
    cx.fillStyle = '#8d6e4f'; cx.beginPath(); cx.ellipse(140, 82, 46, 52, 0, 0, 7); cx.fill();
    cx.fillStyle = '#fff'; [118, 162].forEach(function (x) { cx.beginPath(); cx.arc(x, 70, 17, 0, 7); cx.fill(); });
    cx.fillStyle = '#222'; [118, 162].forEach(function (x) { cx.beginPath(); cx.arc(x, 72, 8, 0, 7); cx.fill(); });
    cx.fillStyle = '#f2a33a'; cx.beginPath(); cx.moveTo(133, 86); cx.lineTo(147, 86); cx.lineTo(140, 98); cx.fill();
    cx.fillStyle = '#555'; cx.font = 'bold 14px system-ui,sans-serif'; cx.textAlign = 'center'; cx.fillText(t('SCRATCH ME', 'GRATTEZ-MOI'), 140, 142);
    cx.globalCompositeOperation = 'destination-out';
    var appui = false, fini = false;
    function pos(e) { var r = cv.getBoundingClientRect(), t = e.touches ? e.touches[0] : e; return [(t.clientX - r.left) * 280 / r.width, (t.clientY - r.top) * 150 / r.height]; }
    function gratter(e) {
      if (!appui || fini) return; e.preventDefault();
      var p = pos(e); cx.beginPath(); cx.arc(p[0], p[1], 18, 0, 7); cx.fill(); verifier();
    }
    var n = 0;
    function verifier() {
      if (++n % 8) return;
      var d = cx.getImageData(0, 0, 280, 150).data, vide = 0;
      for (var i = 3; i < d.length; i += 16) if (d[i] === 0) vide++;
      if (vide / (d.length / 16) > 0.5) revele();
    }
    function revele() {
      fini = true; cv.style.transition = 'opacity .4s'; cv.style.opacity = '0';
      setTimeout(function () { cv.remove(); }, 400);
      ok.style.display = 'inline-block'; gratte = true;
      try { localStorage.setItem('houlou-gratte', '1'); } catch (e) {}
      btn.innerHTML = t('🦉 Your code: <b>' + CODE + '</b> (−5%)', '🦉 Votre code : <b>' + CODE + '</b> (−5 %)');
      prerempli(); track('grattage-revele', {});
    }
    cv.addEventListener('pointerdown', function (e) { appui = true; try { cv.setPointerCapture(e.pointerId); } catch (x) {} gratter(e); });
    cv.addEventListener('pointermove', gratter);
    ['pointerup', 'pointercancel'].forEach(function (t) { cv.addEventListener(t, function () { appui = false; }); });
  }

  function poser() { document.body.appendChild(btn); }
  if (document.body) poser(); else document.addEventListener('DOMContentLoaded', poser);
})();
