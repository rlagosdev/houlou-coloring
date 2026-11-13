import asyncio, sys
from playwright.async_api import async_playwright
async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 1280, 'height': 800}); msgs = []
        pg.on('console', lambda m: msgs.append(m.type + ': ' + m.text)); pg.on('pageerror', lambda e: msgs.append('PAGEERROR ' + str(e)))
        await pg.goto(sys.argv[1], wait_until='networkidle'); await pg.wait_for_timeout(4000)
        await pg.evaluate('window.scrollTo(0, 1.6*2*800)'); await pg.wait_for_timeout(4000)
        print(await pg.evaluate('JSON.stringify({sm: window.__atelier.sm, s: window.__atelier.s})'))
        for m in msgs[:15]: print(m[:300])
        await b.close()
asyncio.run(run())
