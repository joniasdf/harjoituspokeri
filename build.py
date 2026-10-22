eqg=open('guide_eq.html').read() if False else ''
guides=open('guides.html').read()
css=open('style.css').read()
js=''.join(open(f).read() for f in ['logic.js','engine.js','tut.js','tut2.js','ui.js'])
html=f'''<!DOCTYPE html><html lang="fi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Texas Hold'em -harjoituspeli</title><style>{css}</style></head><body>
<header><div class="logo">♠ Hold'em Trainer <small>vain pelimerkit</small></div>
<div class="hctl"><label>Botit <select id="nb"><option>3</option><option selected>4</option><option>5</option></select></label>
<label class="sw"><input type="checkbox" id="hints" checked> Näytä vihjeet</label>
<label>Nopeus <select id="spd"><option value="1200">Hidas</option><option value="700" selected>Normaali</option><option value="250">Nopea</option></select></label>
<button id="new" class="hb">Uusi sessio</button><button id="tutBtn" class="hb">🎓 Tutoriaalit</button><button id="togP" class="hb">☰ Paneeli</button></div></header>
<div id="stats" class="statbar"></div>
<main><section class="tablearea"><div class="tablewrap"><div class="rail"><div class="felt"><div class="center"><div id="board"></div><div id="pot"></div></div></div></div><div id="seats"></div></div>
<div class="actionbar"><button id="next" class="nextb" disabled>Seuraava käsi ▶</button>
<div id="controls" class="off"><div class="sizes"><button data-f="0.5">½ potti</button><button data-f="0.75">¾ potti</button><button data-f="1">Potti</button>
<input type="range" id="amt"><input type="number" id="amtN"></div>
<div class="acts"><button id="bFold" class="a fold">Luovuta</button><button id="bCheck" class="a check">Tarkista</button><button id="bRaise" class="a raise">Korota</button><button id="bAll" class="a allin">All-in</button></div></div></div></section>
<aside id="side"><nav><button class="tab" data-t="coach">Valmentaja</button><button class="tab" data-t="review">Arvio</button><button class="tab" data-t="log">Loki</button><button class="tab" data-t="guide">Oppaat</button></nav>
<div class="pane" id="p-coach"><div id="coach"><i>Valmentaja näyttää vinkit vuorollasi.</i></div></div><div class="pane" id="p-review"><div id="review"><i>Käden arvio näkyy käden jälkeen.</i></div></div>
<div class="pane" id="p-log"><div id="log"></div></div><div class="pane" id="p-guide">{guides}</div></aside></main>
<div id="tutM" class="modal"><div class="mbox"><button id="tutX" class="x">✕</button><div id="tutB"></div></div></div>
<script>{js}</script></body></html>'''
open('index.html','w').write(html)
