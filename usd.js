// Prix en dollars pour les visiteurs des États-Unis (fuseau horaire américain).
// Stripe facture les mêmes montants en USD (currency_options des prix, 03/11/2026).
(function () {
  try {
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (!/^(America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Boise|Indiana|Kentucky|North_Dakota|Juneau|Sitka|Nome|Adak|Menominee|Metlakatla|Yakutat|Puerto_Rico)|Pacific\/Honolulu)/.test(tz)) return;
    var USD = { '4.90': '5.99', '6.90': '7.99', '11.99': '13.99', '17.90': '20.99', '21.90': '25.99', '24.90': '28.99',
      '27.90': '32.99', '29.90': '34.99', '32.90': '37.99', '49.90': '57.99', '59.90': '68.99', '69.70': '76.97' };
    var re = /€\s?(\d+(?:\.\d\d)?)/g;
    var conv = function (s) { return s.replace(re, function (m, n) { return USD[n] ? '$' + USD[n] : m; }); };
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return /SCRIPT|STYLE/.test(n.parentNode.nodeName) ? 2 : 1; } });
    var n, l = [];
    while ((n = w.nextNode())) if (n.nodeValue.indexOf('€') >= 0) l.push(n);
    l.forEach(function (n) { n.nodeValue = conv(n.nodeValue); });
    document.querySelectorAll('[aria-label*="€"],[title*="€"]').forEach(function (e) {
      ['aria-label', 'title'].forEach(function (a) { if (e.getAttribute(a)) e.setAttribute(a, conv(e.getAttribute(a))); }); });
  } catch (e) {}
})();
