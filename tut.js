const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
var TUTQ={
 ev:()=>{const P=R(4,20)*10,C=R(2,10)*10,e=R(15,60);const ev=e/100*(P+C)-C;return {q:`Potti on <b>${P}</b> (sis. vastustajan panos), maksu on <b>${C}</b> ja equitysi on <b>${e} %</b>. Mikä on maksun EV merkkeinä?`,ans:ev,tol:1.5,
  sol:`EV = ${e} % × (${P} + ${C}) − ${C} = ${(e/100*(P+C)).toFixed(1)} − ${C} = <b>${ev.toFixed(1)}</b> → ${ev>=0?'+EV, maksu kannattaa':'−EV, luovuta'}.`};},
 eqsim:()=>{const N=1000,W=R(150,700),T=R(0,60);const eq=(W+T/2)/N*100;return {q:`Simulaatio yhtä vastustajaa vastaan: <b>${W}</b> voittoa, <b>${T}</b> tasapeliä, ${N} simulaatiota. Mikä on equitysi (%)? (tasapeli = puolet potista)`,ans:eq,tol:0.6,
  sol:`Equity = (${W} + ${T}/2) / ${N} = <b>${eq.toFixed(1)} %</b>.`};},
 eqouts:()=>{const o=[4,8,9,12,15][R(0,4)],fl=Math.random()<.5;const ans=fl?o*4:o*2;return {q:`Sinulla on <b>${o}</b> outsia ${fl?'flopilla (kaksi korttia tulossa)':'turnilla (yksi kortti tulossa)'}. Arvioi osumistodennäköisyys (%) 2:n ja 4:n säännöllä.`,ans,tol:0.5,
  sol:`${o} × ${fl?4:2} = <b>${ans} %</b>. (Tarkka: ${fl?(100*(1-(1-o/47)*(1-o/46))).toFixed(1):(100*o/46).toFixed(1)} %)`};},
 po:()=>{const P=R(4,30)*10,C=R(2,12)*10;const p=C/(P+C)*100;return {q:`Potti on <b>${P}</b> ja sinun pitää maksaa <b>${C}</b>. Mikä on pottikerroin eli tarvittava equity (%)?`,ans:p,tol:0.6,
  sol:`${C} / (${P} + ${C}) = <b>${p.toFixed(1)} %</b>, eli suhteena ${(P/C).toFixed(1)}:1.`};},
 poratio:()=>{const C=R(1,5)*20,k=[1.5,2,2.5,3,4,5][R(0,5)],P=C*k;return {q:`Potti on <b>${P}</b> ja maksu <b>${C}</b>. Mikä on pottikerroin suhteena X:1? Anna X.`,ans:k,tol:0.05,
  sol:`${P} / ${C} = <b>${k}:1</b> → tarvittava equity 1/(${k}+1) = ${(100/(k+1)).toFixed(1)} %.`};},
 final:()=>{const P=R(5,25)*10,C=R(2,12)*10,e=R(15,55),po=C/(P+C)*100,ev=e/100*(P+C)-C;return {q:`Potti <b>${P}</b>, maksu <b>${C}</b>, equitysi <b>${e} %</b>. Onko maksu +EV?`,yn:true,ans:ev>=0?1:0,
  sol:`Pottikerroin ${C}/(${P}+${C}) = ${po.toFixed(1)} %. Equity ${e} % ${e>=po?'≥':'<'} ${po.toFixed(1)} %. EV = ${e} % × ${P+C} − ${C} = <b>${ev.toFixed(1)}</b> → <b>${ev>=0?'Kyllä, +EV':'Ei, −EV'}</b>.`};},
 finalOuts:()=>{const o=[8,9,12,15][R(0,3)],P=R(6,20)*10,C=R(2,10)*10,eq=o*2,po=C/(P+C)*100;return {q:`Turnilla sinulla on <b>${o}</b> outsia (vain river tulossa). Potti <b>${P}</b>, maksu <b>${C}</b>. Kannattaako maksaa pelkkien outsien perusteella?`,yn:true,ans:eq>=po?1:0,
  sol:`Equity ≈ ${o} × 2 = ${eq} %. Pottikerroin ${po.toFixed(1)} %. ${eq>=po?'Equity ylittää kertoimen → <b>Kyllä</b>':'Equity jää alle kertoimen → <b>Ei</b>'}. EV ≈ ${(eq/100*(P+C)-C).toFixed(1)}.`};}};
function checkAns(q,v){if(q.opts)return (+v)===q.ans;if(q.yn)return (+v)===q.ans;const x=parseFloat(String(v).replace(',','.'));return !isNaN(x)&&Math.abs(x-q.ans)<=q.tol;}
var TUTS={
 ev:{title:'EV eli odotusarvo',steps:[`<p><b>EV (expected value)</b> kertoo, paljonko päätös tuottaa keskimäärin, jos toistaisit sen lukemattomia kertoja.</p><p>Maksulle: <b>EV = equity × (potti + maksu) − maksu</b>. Potti sisältää jo vastustajan panoksen.</p><p>Yksittäinen käsi voi hävitä, mutta +EV-päätökset tuottavat voittoa pitkällä aikavälillä.</p>`,
  `<p><b>Esimerkki:</b> Potti 100, maksu 50, equity 40 %.</p><p>EV = 0,40 × 150 − 50 = 60 − 50 = <b>+10</b>. Joka maksu tuottaa keskimäärin 10 merkkiä → maksa.</p><p>Jos equity olisi 25 %: 0,25 × 150 − 50 = <b>−12,5</b> → luovuta.</p>`],qs:['ev','ev','ev','final']},
 equity:{title:'Equity',steps:[`<p><b>Equity</b> on se osuus potista, jonka voitat keskimäärin, jos käsi pelattaisiin loppuun monta kertaa. Tasapelissä potti jaetaan, joten tasapeli kahden kesken lasketaan puolikkaana voittona.</p><p>Peli laskee equityn <b>Monte Carlo -menetelmällä</b>: se jakaa satunnaiset kädet vastustajille ja loput pöytäkortit esim. 2000 kertaa ja laskee (voitot + jaetut osuudet) / simulaatiot.</p>`,
  `<p><b>Esimerkki:</b> 1000 simulaatiota: 420 voittoa ja 40 tasapeliä → (420 + 40/2)/1000 = <b>44 %</b>.</p><p>Pöydässä arvioit equityä outseilla: flopilla outsit × 4, turnilla outsit × 2. Väriveto 9 outsia flopilla ≈ 36 %.</p><p>Muistisääntöjä: pari vs. kaksi yliskorttia ~55/45, dominoitu käsi (AK vs AQ) ~70/30, AA vs. satunnainen käsi ~85 %.</p>`],qs:['eqsim','eqouts','eqsim','eqouts']},
 po:{title:'Pottikerroin',steps:[`<p><b>Pottikerroin</b> kertoo, montako prosenttia equityä tarvitset, jotta maksu kannattaa: <b>maksu / (potti + maksu)</b>.</p><p>Sama suhteena: <b>potti : maksu</b>. Esim. 3:1 → tarvitset 1/(3+1) = 25 %.</p>`,
  `<p><b>Esimerkki:</b> Potti 150, maksu 50 → 50/200 = <b>25 %</b>, eli 3:1.</p><p>Jos equitysi on 30 % → maksu kannattaa. Jos 20 % → luovuta.</p>`],qs:['po','poratio','po','finalOuts']},
 final:{title:'Loppukoe: EV + equity + pottikerroin',steps:[`<p>Yhdistä kaikki: laske pottikerroin, vertaa equityyn ja päättele EV. 5 kysymystä.</p>`],qs:['final','finalOuts','ev','po','final']}};
let TS=null;
function tutOpen(){document.getElementById('tutM').style.display='flex';tutMenu();}
var tutMenu=function(){TS=null;document.getElementById('tutB').innerHTML='<h2>Tutoriaalit</h2>'+Object.entries(TUTS).map(([k,t])=>`<button class="tbtn" onclick="tutStart('${k}')">${t.title}</button>`).join('');}
function tutStart(k){const t=TUTS[k];TS={k,i:0,items:t.steps.map(s=>({html:s})).concat(t.qs.map(g=>({q:TUTQ[g]()}))),ok:0,nq:t.qs.length};tutShow();}
function tutShow(){const t=TUTS[TS.k],it=TS.items[TS.i],b=document.getElementById('tutB');let h=`<h2>${t.title}</h2><div class="prog">Vaihe ${TS.i+1}/${TS.items.length}</div>`;
 if(it.html)h+=it.html+`<button class="tbtn" onclick="tutNext()">Seuraava ▶</button>`;
 else{const q=it.q;h+=`<p>❓ ${q.q}</p>`+(q.opts?q.opts.map((o,i)=>`<button class="tbtn" onclick="tutAns(${i})">${o}</button>`).join('<br>'):q.yn?`<button class="tbtn" onclick="tutAns(1)">Kyllä</button><button class="tbtn" onclick="tutAns(0)">Ei</button>`:`<input id="tutIn" inputmode="decimal" style="font-size:18px;width:120px"> <button class="tbtn" onclick="tutAns(document.getElementById('tutIn').value)">Tarkista</button>`)+'<div id="tutF"></div>';}
 b.innerHTML=h+`<p><a href="#" onclick="tutMenu();return false">← Valikkoon</a></p>`;}
function tutAns(v){const it=TS.items[TS.i];if(it.done)return;it.done=true;if(it.q.opts)document.querySelectorAll('#tutB .tbtn').forEach((b,i)=>{if(i<it.q.opts.length)b.classList.add(i===it.q.ans?'right':(i===+v?'wrong':''))});const ok=checkAns(it.q,v);if(ok)TS.ok++;
 document.getElementById('tutF').innerHTML=`<div class="${ok?'ok':'bad'}">${ok?'✅ Oikein!':'❌ Ei aivan.'} ${it.q.sol}</div><button class="tbtn" onclick="tutNext()">${TS.i+1<TS.items.length?'Seuraava ▶':'Valmis'}</button>`;}
function tutNext(){TS.i++;if(TS.i>=TS.items.length){tutSave(TS.k,TS.ok,TS.nq);document.getElementById('tutB').innerHTML=`<h2>${TUTS[TS.k].title} – valmis!</h2><p>Oikein ${TS.ok}/${TS.nq}.</p><button class="tbtn" onclick="tutStart('${TS.k}')">Uudestaan (uudet luvut)</button> <button class="tbtn" onclick="tutMenu()">Valikkoon</button>`;return;}tutShow();}

