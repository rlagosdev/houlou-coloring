/* Mesure d'audience anonyme RLBX (Umami auto-hébergé sur stats.rlbx.tech) : sans cookie, sans adresse IP conservée,
   aucune donnée partagée ni croisée. Source unique : chaines-ops/mesure/mesure-rlbx.js (copiée sur chaque site).

   <script defer src="/mesure-rlbx.js" data-site="<id du site Umami>" data-page="<nom court>"></script>

   Événements envoyés (le suffixe « -test » remplace l'événement normal pour une adresse de test ou un paiement Stripe de test) :
     defilement-25/50/75/100            défilement de la page
     clic-paiement {produit, prix}      clic vers un paiement Stripe
     clic-bouton {bouton}               clic sur un autre bouton d'appel à l'action (bouton = data-mesure s'il existe)
     formulaire-debut {formulaire}      premier clic dans un formulaire
     formulaire-envoi {formulaire}      tentative d'envoi
     inscription-ok / inscription-erreur {formulaire, erreur}
     vente {produit, montant}           page de confirmation après paiement (data-vente sur la balise)
   Chaque événement porte aussi page, utm_campaign et utm_content (lettre de la pub).

   Ne plus compter ses propres visites : ouvrir une fois la page avec ?mesure=non (sur chaque site et chaque appareil) ;
   ?mesure=oui pour revenir. Cela pose localStorage « umami.disabled », que le script d'Umami respecte.

   Vérifier la mesure sans fausser les chiffres : ouvrir la page avec ?mesure=test. Pour tout le reste de l'onglet, aucune
   page vue n'est comptée (ni visite, ni visiteur) : chaque page envoie à la place l'événement « visite-test », et tous les
   événements portent le suffixe « -test » (defilement-50-test, clic-paiement-test…).
   Marche aussi sur un appareil exclu par ?mesure=non : l'exclusion est levée le temps de l'onglet, puis remise dès qu'on
   quitte la page (elle ne compte donc pas ses visites suivantes). */
(function () {
  'use strict';
  var moi = document.currentScript;
  if (!moi) return;
  var SITE = moi.getAttribute('data-site');
  var PAGE = moi.getAttribute('data-page') || location.pathname;
  var HOTE = 'https://stats.rlbx.tech';
  var GARDER = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'p'];

  function lire(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function ecrire(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function sLire(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sEcrire(k, v) { try { if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) {} }

  var q = new URLSearchParams(location.search);
  if (q.get('mesure') === 'non') ecrire('umami.disabled', '1');
  if (q.get('mesure') === 'oui') { ecrire('umami.disabled', null); sEcrire('mesure-test', null); sEcrire('mesure-reexclure', null); }
  // Mode test (?mesure=test) : onglet marqué test ; un appareil exclu est remesuré le temps de l'onglet seulement
  if (q.get('mesure') === 'test') {
    sEcrire('mesure-test', '1');
    if (lire('umami.disabled')) sEcrire('mesure-reexclure', '1');
  }
  if (sLire('mesure-test') === '1' && sLire('mesure-reexclure') === '1') {
    ecrire('umami.disabled', null);
    // remise de l'exclusion en quittant la page (la page suivante de l'onglet la relève au chargement)
    window.addEventListener('pagehide', function () { ecrire('umami.disabled', '1'); });
    window.addEventListener('pageshow', function (e) { if (e.persisted) ecrire('umami.disabled', null); });
  }
  if (!SITE || lire('umami.disabled')) return;

  // utm de la pub, gardés pour l'onglet (la visite peut passer d'une page à l'autre du même site)
  var BASE = { page: PAGE };
  ['utm_campaign', 'utm_content'].forEach(function (k) {
    var v = q.get(k) || sLire('mesure-' + k);
    if (v) { v = v.slice(0, 80); BASE[k] = v; sEcrire('mesure-' + k, v); }
  });
  var test = sLire('mesure-test') === '1';

  // Adresses de test : rlagosdev+…, x@y.fr, t2@ex.fr
  function adresseTest(e) {
    e = String(e || '').trim().toLowerCase();
    return /^rlagosdev\+/.test(e) || e === 'x@y.fr' || e === 't2@ex.fr';
  }
  function marquerTest() { test = true; sEcrire('mesure-test', '1'); }

  // Adresse envoyée à Umami : chemin + utm et ?p= seulement (ni fbclid, ni session_id, ni e-mail)
  function propre(u) {
    try {
      var x = new URL(u, location.href), r = new URLSearchParams();
      GARDER.forEach(function (k) { if (k !== 'p' && x.searchParams.has(k)) r.set(k, x.searchParams.get(k).slice(0, 80)); });
      var s = r.toString();
      // ?p=parents → /parents : une ligne par page dans Umami (le Carnet sert toutes ses pages sur « / »)
      var chemin = x.searchParams.get('p') ? '/' + x.searchParams.get('p').replace(/[^a-z0-9_-]/gi, '') : x.pathname.replace(/index\.html$/, '');
      return x.origin + chemin + (s ? '?' + s : '');
    } catch (e) { return u; }
  }
  window.rlbxAvantEnvoi = function (type, p) {
    if (p && p.url) p.url = propre(p.url);
    if (p && p.referrer) { try { var r = new URL(p.referrer); p.referrer = r.origin + r.pathname; } catch (e) {} }
    return p;
  };

  var file = [];
  function ev(nom, donnees) {
    var d = {}, k;
    for (k in BASE) d[k] = BASE[k];
    for (k in (donnees || {})) d[k] = donnees[k];
    if (test) nom += '-test';
    if (window.umami && window.umami.track) window.umami.track(nom, d); else file.push([nom, d]);
  }

  var u = document.createElement('script');
  u.defer = true;
  u.src = HOTE + '/m.js';
  u.setAttribute('data-website-id', SITE);
  u.setAttribute('data-before-send', 'rlbxAvantEnvoi');
  // Mode test : pas de page vue (elle compterait une visite), un événement « visite-test » à la place
  var modeTest = sLire('mesure-test') === '1';
  if (modeTest) u.setAttribute('data-auto-track', 'false');
  if (moi.nonce) u.nonce = moi.nonce;
  u.onload = function () { var f = file; file = []; f.forEach(function (x) { window.umami.track(x[0], x[1]); }); };
  document.head.appendChild(u);
  if (modeTest) ev('visite');

  // Vente confirmée (page après paiement) : <script … data-vente='{"produit":"…","montant":4.9,"test":false}'>
  var vente = moi.getAttribute('data-vente');
  if (vente) {
    try {
      var v = JSON.parse(vente);
      if (v.test) marquerTest();
      ['utm_source', 'utm_campaign', 'utm_content'].forEach(function (k) { if (v[k]) BASE[k] = v[k]; });
      // une seule fois par achat (la page de téléchargement peut être rouverte pendant 30 jours)
      var cle = 'mesure-vente-' + (v.id || '');
      if (!v.id || !lire(cle)) { ev('vente', { produit: v.produit, montant: v.montant }); if (v.id) ecrire(cle, '1'); }
    } catch (e) {}
  }

  // Défilement 25/50/75/100 %
  var vus = {};
  function defil() {
    var h = document.documentElement, t = h.scrollHeight - h.clientHeight;
    var pc = t <= 0 ? 100 : Math.round((window.scrollY || h.scrollTop) / t * 100);
    [25, 50, 75, 100].forEach(function (n) { if (pc >= n - 1 && !vus[n]) { vus[n] = 1; ev('defilement-' + n); } });
  }
  var attente;
  window.addEventListener('scroll', function () { clearTimeout(attente); attente = setTimeout(defil, 200); }, { passive: true });

  function texte(el) { return (el.innerText || el.value || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 60); }
  function nomForm(f) { return f ? (f.id || f.getAttribute('name') || f.getAttribute('action') || 'formulaire').slice(0, 40) : 'formulaire'; }

  // Clics : paiement Stripe, puis tout autre bouton d'appel à l'action
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a, button, input[type=submit]');
    if (!el) return;
    var href = el.getAttribute('href') || '';
    if (/^https:\/\/(buy|checkout)\.stripe\.com\//.test(href)) {
      var t = texte(el), bloc = el.closest('section, article, li, .card, header, div');
      var titre = bloc && bloc.querySelector('h1, h2, h3, h4');
      var prix = (t.match(/[€$]\s?\d+(?:[.,]\d{2})?|\d+(?:[.,]\d{2})?\s?[€$]/) || [''])[0];
      ev('clic-paiement', { produit: (titre ? texte(titre) : t).slice(0, 60), prix: prix, lien: href.split('?')[0].split('/').pop() });
      return;
    }
    var classe = el.getAttribute('class') || '';
    var envoi = el.tagName === 'INPUT' || (el.tagName === 'BUTTON' && (el.getAttribute('type') || 'submit') === 'submit' && el.form);
    var cta = envoi || /\b(btn|button|cta|buy|bouton)\b/i.test(classe) || /^#(free|ff|reserver|formulaire|f$|f1$)/.test(href);
    // data-mesure="jouer-web" : nom fixe du bouton, le même dans toutes les langues de la page
    if (cta) ev('clic-bouton', { bouton: (el.getAttribute('data-mesure') || texte(el)).slice(0, 60), cible: href.slice(0, 60) });
  }, true);

  // Premier clic dans chaque formulaire, et tentative d'envoi
  var debuts = {};
  document.addEventListener('focusin', function (e) {
    var f = e.target.form || (e.target.closest && e.target.closest('form'));
    if (!f || !/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    var n = nomForm(f);
    if (!debuts[n]) { debuts[n] = 1; ev('formulaire-debut', { formulaire: n }); }
  }, true);
  var dernierForm = '';
  document.addEventListener('submit', function (e) {
    var f = e.target, m = f.querySelector('input[type=email], input[name=email]');
    if (m && adresseTest(m.value)) marquerTest();
    dernierForm = nomForm(f);
    sEcrire('mesure-envoi', dernierForm);
    ev('formulaire-envoi', { formulaire: dernierForm });
  }, true);

  // Inscriptions envoyées en JS (Houlou, Precyx, Renfort) : réponse de /api/inscription
  if (window.fetch) {
    var fetchOrig = window.fetch;
    window.fetch = function (res, init) {
      var url = typeof res === 'string' ? res : (res && res.url) || '';
      var p = fetchOrig.apply(this, arguments);
      if (url.indexOf('/api/inscription') < 0) return p;
      try { if (adresseTest(JSON.parse(init && init.body || '{}').email)) marquerTest(); } catch (e) {}
      var f = dernierForm || 'formulaire';
      p.then(function (r) {
        r.clone().json().then(function (j) {
          if (r.ok && j && j.ok) ev('inscription-ok', { formulaire: f });
          else ev('inscription-erreur', { formulaire: f, erreur: String((j && j.erreur) || r.status).slice(0, 30) });
        }).catch(function () { ev('inscription-erreur', { formulaire: f, erreur: 'reponse-' + r.status }); });
      }, function () { ev('inscription-erreur', { formulaire: f, erreur: 'reseau' }); });
      return p;
    };
  }

  // Inscriptions envoyées par le serveur (Carnet du jeu) : message affiché après l'envoi
  var envoye = sLire('mesure-envoi');
  if (envoye) {
    sEcrire('mesure-envoi', null);
    var lancer = function () {
      if (document.querySelector('form ~ p.message[role=status], p.message[role=status]')) ev('inscription-ok', { formulaire: envoye });
      else if (document.querySelector('p.alerte[role=alert]')) ev('inscription-erreur', { formulaire: envoye, erreur: 'refus' });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lancer); else lancer();
  }
})();
