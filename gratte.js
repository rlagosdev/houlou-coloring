// Houlou à gratter — Black Friday 2026 (10/11/2026).
// Bandeau tout en haut de la page : le client gratte, prend son code, va acheter.
// Prix inchangés : la carte révèle un vrai code de −5 % (HOULOU5, Stripe, valable jusqu'au 30/11/2026),
// pré-rempli ensuite dans tous les liens Stripe de la page.
(function () {
  var CODE = 'HOULOU5', FIN = new Date('2026-12-01T00:00:00+01:00');
  if (new Date() >= FIN) return;
  var FR = /^fr/i.test(document.documentElement.lang || '') || location.pathname.indexOf('/fr/') === 0;
  function t(en, fr) { return FR ? fr : en; }
  var gratte = false;
  try {
    if (/[?&]regratter\b/.test(location.search)) localStorage.removeItem('houlou-gratte'); // pour revoir la carte
    gratte = localStorage.getItem('houlou-gratte') === '1';
  } catch (e) {}

  function track(n, d) { try { window.umami && window.umami.track(n, d || {}); } catch (e) {} }
  function prerempli() {
    document.querySelectorAll('a[href*="buy.stripe.com/"]').forEach(function (a) {
      if (a.href.indexOf('prefilled_promo_code') < 0) a.href += (a.href.indexOf('?') < 0 ? '?' : '&') + 'prefilled_promo_code=' + CODE;
    });
  }
  function allerAcheter() {
    track('grattage-achat');
    var a = document.querySelector('a[href*="buy.stripe.com/"]');
    if (a) a.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  var css = document.createElement('style');
  css.textContent =
    '.hg{background:#111;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:14px 12px 16px}' +
    '.hg h2{margin:0;font-size:20px;line-height:1.2;color:#fff}.hg h2 b{color:#ffcc33}' +
    '.hg p{margin:4px 0 10px;font-size:14px;color:#ddd}' +
    '.hg-zone{position:relative;width:260px;max-width:68vw;flex:none;height:90px;margin:0 auto;border-radius:12px;overflow:hidden;background:#fff7d6}' +
    '.hg-code{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#111}' +
    '.hg-code small{font-size:12px;color:#7a5b00;font-weight:700}.hg-code strong{font-size:30px;letter-spacing:2px}' +
    '.hg-zone canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:grab}' +
    '.hg-ok{display:none;margin:12px auto 0;background:#ffcc33;color:#111;border:0;border-radius:999px;padding:12px 22px;font:800 16px system-ui,sans-serif;cursor:pointer}' +
    '.hg-fin{font-size:11px;color:#999;margin-top:8px}' +
    '.hg-ligne{display:flex;align-items:center;justify-content:center;gap:6px}' +
    '.hg-fleche{font-size:30px;color:#ffcc33;animation:hgF .8s ease-in-out infinite alternate}' +
    '.hg-fleche.d{animation-name:hgFd}' +
    '@keyframes hgF{from{transform:translateX(-6px)}to{transform:translateX(4px)}}' +
    '@keyframes hgFd{from{transform:translateX(6px)}to{transform:translateX(-4px)}}' +
    '.hg-main{position:absolute;top:50%;left:20%;font-size:34px;pointer-events:none;z-index:2;animation:hgM 1.6s ease-in-out infinite;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))}' +
    '@keyframes hgM{0%{left:12%;transform:translateY(-30%) rotate(-10deg)}50%{left:72%;transform:translateY(-50%) rotate(10deg)}100%{left:12%;transform:translateY(-30%) rotate(-10deg)}}';
  document.head.appendChild(css);

  var bande = document.createElement('div');
  bande.className = 'hg';
  bande.innerHTML =
    '<h2>🖤 Black Friday — <b>' + t('scratch Houlou', 'grattez Houlou') + '</b> 🦉</h2>' +
    '<p>' + t('Take your code, then go shop: it is applied automatically.', 'Prenez votre code et allez acheter : il s\'applique tout seul.') + '</p>' +
    '<div class="hg-ligne">' + (gratte ? '' : '<span class="hg-fleche">➜</span>') + '<div class="hg-zone">' + (gratte ? '' : '<span class="hg-main">👆</span>') + '<div class="hg-code"><small>' + t('5% OFF ANY HOULOU PRODUCT', '−5 % SUR UN PRODUIT HOULOU') + '</small><strong>' + CODE + '</strong></div>' +
    (gratte ? '' : '<canvas width="280" height="90"></canvas>') + '</div>' + (gratte ? '' : '<span class="hg-fleche d">⬅</span>') + '</div>' +
    '<button class="hg-ok">' + t('Shop now with my code →', 'J\'achète avec mon code →') + '</button>' +
    '<div class="hg-fin">' + t('One use per order, until November 30, 2026.', 'Une fois par commande, jusqu\'au 30 novembre 2026.') + '</div>';
  var ok = bande.querySelector('.hg-ok');
  ok.addEventListener('click', allerAcheter);

  function poser() {
    document.body.insertBefore(bande, document.body.firstChild);
    if (gratte) { ok.style.display = 'block'; prerempli(); return; }
    var cv = bande.querySelector('canvas'), cx = cv.getContext('2d'), W = 280, H = 90;
    cx.fillStyle = '#b9b9c3'; cx.fillRect(0, 0, W, H);
    // petite chouette Houlou
    cx.fillStyle = '#8d6e4f'; cx.beginPath(); cx.ellipse(60, 46, 28, 32, 0, 0, 7); cx.fill();
    cx.fillStyle = '#fff'; [49, 71].forEach(function (x) { cx.beginPath(); cx.arc(x, 39, 10, 0, 7); cx.fill(); });
    cx.fillStyle = '#222'; [49, 71].forEach(function (x) { cx.beginPath(); cx.arc(x, 40, 5, 0, 7); cx.fill(); });
    cx.fillStyle = '#f2a33a'; cx.beginPath(); cx.moveTo(55, 49); cx.lineTo(65, 49); cx.lineTo(60, 57); cx.fill();
    cx.fillStyle = '#333'; cx.font = 'bold 18px system-ui,sans-serif'; cx.textAlign = 'center';
    cx.fillText(t('SCRATCH ME', 'GRATTEZ-MOI'), 180, 44);
    cx.font = '13px system-ui,sans-serif'; cx.fillText(t('with your finger 👆', 'avec le doigt 👆'), 180, 64);
    cx.globalCompositeOperation = 'destination-out';
    var appui = false, fini = false, n = 0, vu = false;
    function pos(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; }
    function gratter(e) {
      if (!appui || fini) return; e.preventDefault();
      if (!vu) { vu = true; track('grattage-commence'); bande.querySelectorAll('.hg-main,.hg-fleche').forEach(function (x) { x.remove(); }); }
      var p = pos(e); cx.beginPath(); cx.arc(p[0], p[1], 16, 0, 7); cx.fill();
      if (++n % 6) return;
      var d = cx.getImageData(0, 0, W, H).data, vide = 0;
      for (var i = 3; i < d.length; i += 16) if (d[i] === 0) vide++;
      if (vide / (d.length / 16) > 0.5) revele();
    }
    function revele() {
      fini = true; cv.style.transition = 'opacity .4s'; cv.style.opacity = '0';
      setTimeout(function () { cv.remove(); }, 400);
      ok.style.display = 'block';
      try { localStorage.setItem('houlou-gratte', '1'); } catch (e) {}
      prerempli(); track('grattage-revele');
    }
    cv.addEventListener('pointerdown', function (e) { appui = true; try { cv.setPointerCapture(e.pointerId); } catch (x) {} gratter(e); });
    cv.addEventListener('pointermove', gratter);
    ['pointerup', 'pointercancel'].forEach(function (ty) { cv.addEventListener(ty, function () { appui = false; }); });
  }
  if (document.body) poser(); else document.addEventListener('DOMContentLoaded', poser);
})();
