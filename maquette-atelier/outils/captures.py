# Captures de contrôle : chaque écran, caméra stabilisée (fin d'activité) et à mi-animation, ordinateur et téléphone.
import asyncio, sys, os
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]; os.makedirs(OUT, exist_ok=True)
ONLY = sys.argv[3].split(',') if len(sys.argv) > 3 and sys.argv[3] != '-' else None
DEV = sys.argv[4] if len(sys.argv) > 4 else 'ordi,tel'
NOMS = ['accueil', 'coloriage', 'mystere', 'math', 'seek', 'phonics', 'writing', 'crafts', 'advent', 'boutique']
async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        for dev, vp, mob in (('ordi', {'width': 1280, 'height': 800}, False), ('tel', {'width': 390, 'height': 844}, True)):
            if dev not in DEV: continue
            ctx = await b.new_context(viewport=vp, device_scale_factor=1, is_mobile=mob, has_touch=mob)
            pg = await ctx.new_page(); msgs = []
            pg.on('console', lambda m: msgs.append(m.text)); pg.on('pageerror', lambda e: msgs.append('ERR ' + str(e)))
            await pg.goto(URL, wait_until='networkidle'); await pg.wait_for_timeout(2500)
            await pg.evaluate('window.__atelier && window.__atelier.ready')
            H = vp['height'] * 2
            for i, n in enumerate(NOMS):
                if ONLY and n not in ONLY: continue
                plans = [('fin', 0.5)] if i in (0, 9) else [('mi', 0.22), ('fin', 0.5)]
                for tag, f in plans:
                    y = int((i + f) * H) if i < 9 else 10 ** 7
                    await pg.evaluate(f'window.scrollTo(0, {y})')
                    for _ in range(60):
                        await pg.wait_for_timeout(150)
                        d = await pg.evaluate('Math.abs(window.__atelier.sm - window.__atelier.s)')
                        if d < 0.002: break
                    await pg.wait_for_timeout(900)
                    await pg.screenshot(path=f'{OUT}/{dev}-{i:02d}-{n}-{tag}.png')
            print(dev, 'messages:', [m for m in msgs if 'ERR' in m or 'rror' in m][:8])
            await ctx.close()
        await b.close()
asyncio.run(run())
