// Worker Cloudflare « houlou-download » — téléchargement du livre Houlou réservé aux acheteurs.
// Stripe redirige l'acheteur vers  https://<worker>/?session_id={CHECKOUT_SESSION_ID}
// Le Worker vérifie la session auprès de Stripe (payée, bon lien de paiement, achat de moins de 30 jours)
// puis sert le PDF depuis le bucket R2 (liaison LIVRES -> rlbx-medias). Aucun lien direct vers le PDF n'est donné.
// Secret à poser par Régis dans le Worker : STRIPE_KEY (clé restreinte Stripe, lecture seule des Checkout Sessions).

const LIEN_PAIEMENT = 'plink_1UXA2iA2CHUOGYXzZXyg72Hc';
// CLE_PDF : variable PDF_KEY du Worker (chemin du PDF dans le bucket, gardé hors du code public)
const DUREE_JOURS = 30;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const sid = url.searchParams.get('session_id') || '';
    if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sid)) return page(400, aide('This link is not valid.'));

    const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sid}`, {
      headers: { Authorization: `Bearer ${env.STRIPE_KEY}` },
    });
    if (!r.ok) return page(403, aide('We could not find this purchase.'));
    const s = await r.json();
    const age = Date.now() / 1000 - (s.created || 0);
    if (s.payment_status !== 'paid' || s.payment_link !== LIEN_PAIEMENT)
      return page(403, aide('We could not confirm a payment for this link.'));
    if (age > DUREE_JOURS * 86400)
      return page(410, aide('This download link has expired.'));

    if (url.pathname === '/pdf') {
      const obj = await env.LIVRES.get(env.PDF_KEY);
      if (!obj) return page(500, aide('The file is temporarily unavailable.'));
      return new Response(obj.body, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="houlous-coloring-book.pdf"',
          'Cache-Control': 'private, no-store',
        },
      });
    }
    return page(200, merci(sid, s.customer_details?.email));
  },
};

function page(status, corps) {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>Your Houlou Coloring Book</title><style>
:root{--bg:#fdf7ee;--paper:#fff;--ink:#2a2740;--muted:#6b6880;--accent:#5aa9e6;--accent-ink:#fff;--line:#eadfce}
@media (prefers-color-scheme: dark){:root{--bg:#1d1b2a;--paper:#262338;--ink:#f0edf7;--muted:#b3aecb;--accent:#78bdf2;--accent-ink:#0f1626;--line:#3a3652;color-scheme:dark}}
body{background:var(--bg);color:var(--ink);font:17px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;margin:0}
main{max-width:620px;margin:0 auto;padding:40px 18px 60px;text-align:center}
.card{background:var(--paper);border:1px solid var(--line);border-radius:24px;padding:32px 22px}
h1{font-size:1.8rem;line-height:1.2;margin:8px 0 12px}.owl{font-size:3rem}
.btn{display:inline-block;margin:20px 0 8px;background:var(--accent);color:var(--accent-ink);font-weight:700;font-size:1.1rem;padding:15px 28px;border-radius:999px;text-decoration:none}
.muted{color:var(--muted);font-size:.95rem}ol{text-align:left;max-width:440px;margin:20px auto 0;padding-left:22px}a{color:var(--accent)}
</style></head><body><main><div class="card">${corps}</div></main></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' } });
}

function merci(sid, email) {
  return `<div class="owl">🦉</div><h1>Thank you! Your book is ready.</h1>
<p>Here is <strong>Houlou's Coloring Book</strong>: 20 pages to print and color, as many times as you like.</p>
<a class="btn" href="/pdf?session_id=${sid}">⬇ Download the PDF (12 MB)</a>
<p class="muted">Bookmark this page: the download stays available for ${DUREE_JOURS} days${email ? ` (purchase by ${esc(email)})` : ''}.</p>
<ol><li>Open the PDF and choose <em>Print</em>.</li><li>Pick A4 or Letter, and "Fit to page".</li><li>Hand over the crayons! 🖍️</li></ol>
<p class="muted" style="margin-top:24px">Any problem? Write to <a href="mailto:contact@rlbx.tech">contact@rlbx.tech</a> and we'll send it to you.<br>
For personal, family and classroom use — please don't share the file publicly. Thank you!</p>`;
}

function aide(msg) {
  return `<div class="owl">🦉</div><h1>${msg}</h1>
<p>If you bought Houlou's Coloring Book, write to <a href="mailto:contact@rlbx.tech">contact@rlbx.tech</a> with your receipt and we'll send you the book.</p>
<p class="muted"><a href="https://coloring.houlou.fr">Back to Houlou's Coloring Book</a></p>`;
}

function esc(t) {
  return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
