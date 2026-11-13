import asyncio
from playwright.async_api import async_playwright
async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 900, 'height': 600})
        await pg.goto('http://127.0.0.1:8765/index.html', wait_until='networkidle'); await pg.wait_for_timeout(5000)
        # bec de Houlou : position monde du bec par rapport au centre du modèle
        r = await pg.evaluate('''() => { const o = window.__atelier.owl; o.rotation.y = 0; o.updateMatrixWorld(true); let bec = null, tete = null;
          o.traverse(n => { if (n.name === 'bec_haut') bec = n; if (n.name === 'tete') tete = n; });
          const v = new (o.position.constructor)(); bec.getWorldPosition(v); const t = new (o.position.constructor)(); tete.getWorldPosition(t);
          return { bec: [v.x, v.y, v.z], tete: [t.x, t.y, t.z], pos: [o.position.x, o.position.y, o.position.z] }; }''')
        print(r)
        await b.close()
asyncio.run(run())
