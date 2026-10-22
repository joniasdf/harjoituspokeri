const $=id=>document.getElementById(id);let G,stats={hands:0,dec:0,match:0,start:0},pending=null,curAdvice=null;
const ACTFI={fold:'Luovuta',check:'Tarkista',call:'Maksa',bet:'Panosta',raise:'Korota',allin:'All-in'};
function grp(a){return (a==='bet'||a==='raise'||a==='allin')?'aggr':a;}
const SEEN=new Set(),SHOWN=new Set();
function cardHTML(c,hide,key){if(hide||!c){return `<div class="card back ${key&&!SEEN.has(key)?'deal':''}"></div>`+(key?(SEEN.add(key),''):'');}
 const red=c.s==='h'||c.s==='d',r=c.r===10?'10':RANKS[c.r-2],s=SUITSYM[c.s];let cls='';if(key){if(!SEEN.has(key))cls='deal';else if(!SHOWN.has(key))cls='flip';SEEN.add(key);SHOWN.add(key);}
 return `<div class="card ${red?'red':'blk'} ${cls}"><span class="ci">${r}<br>${s}</span><span class="cc">${s}</span><span class="ci br">${r}<br>${s}</span></div>`;}
function chipsHTML(a){if(!a)return '';const cols=a>=500?['#222','#7b2cbf']:a>=100?['#111','#222']:a>=25?['#1b7f3b','#2e9e52']:['#c62828','#e53935'];const n=Math.min(5,1+Math.floor(Math.log10(a+1)*1.5));
 let h='<div class="stack">';for(let i=0;i<n;i++)h+=`<i style="bottom:${i*3}px;background:${i%2?cols[1]:cols[0]}"></i>`;return h+`</div><span class="amt">${a}</span>`;}
function seatPos(i,n){const ang=Math.PI/2+i*2*Math.PI/n;const m=window.innerWidth<650,rx=m?36:44;return {x:50+rx*Math.cos(ang),y:50+41*Math.sin(ang),bx:50+(m?17:27)*Math.cos(ang),by:50+(m?14:24)*Math.sin(ang)};}
function render(){const g=G;if(!g)return;const show=g.over&&g.players.filter(p=>!p.folded).length>1,n=g.players.length;
 $('seats').innerHTML=g.players.map((p,i)=>{const P=seatPos(i,n);const act=g.turn===i&&!g.over;const hk=g.handNo+'-'+i+'-';
  const cards=p.out?'':(p.hole||[]).map((c,j)=>cardHTML(c,!p.human&&!(show&&!p.folded),hk+j)).join('');
  const mark=i===g.dealer?'<b class="btnD">D</b>':'';const bl=!g.over&&g.street==='preflop'?(i===g.sbI?'<b class="blind">SB</b>':i===g.bbI?'<b class="blind bb">BB</b>':''):'';
  return `<div class="seat ${p.folded?'folded':''} ${p.out?'out':''} ${act?'turn':''} ${g.over&&g.winners.includes(p.id)?'win':''} ${p.human?'me':''}" style="left:${P.x}%;top:${P.y}%">
  <div class="hole">${cards}</div><div class="plate"><div class="av" style="--c:${['#4a90d9','#e57373','#81c784','#ffb74d','#ba68c8','#4dd0e1'][i]}">${act?'<svg class="ring" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18"/></svg>':''}${p.human?'🙂':p.name[0]}</div>
  <div class="info"><div class="nm">${p.name}${p.style?` <small>${STYLES[p.style].name}</small>`:''}</div><div class="ch">${p.out?'Pudonnut':p.chips}</div></div>${mark}${bl}</div>
  ${oppStats(p)}<div class="la">${p.lastAct||''}${show&&p.score&&!p.folded?' · '+catName(p.score):''}</div></div>
  <div class="bet" style="left:${P.bx}%;top:${P.by}%">${chipsHTML(p.bet)}</div>`;}).join('');
 $('board').innerHTML=[0,1,2,3,4].map(k=>g.board[k]?cardHTML(g.board[k],false,g.handNo+'-b'+k):'<div class="card slot"></div>').join('');
 const potBets=g.players.reduce((s,p)=>s+p.totalBet-p.bet,0);$('pot').innerHTML=(potBets?chipsHTML(potBets):'')+`<div class="potl">Potti: ${g.pot()}</div>`;
 $('stats').innerHTML=`Kädet <b>${stats.hands}</b> · Pino <b>${g.players[0].chips}</b> (${g.players[0].chips-stats.start>=0?'+':''}${g.players[0].chips-stats.start}) · Päätökset <b>${stats.dec}</b> · Valmentajan mukaisia <b>${stats.dec?Math.round(100*stats.match/stats.dec):0} %</b>`;}
function log(t){const d=$('log');d.innerHTML+=t+'<br>';d.scrollTop=1e9;}
function onUser(p){const g=G;const opp=g.players.filter(q=>!q.folded&&q!==p).length;const tc=g.toCall(p);
 $('controls').classList.remove('off');openPanel('coach');$('bCheck').textContent=tc>0?`Maksa ${tc}`:'Tarkista';
 const minTo=Math.min(g.curBet+g.minRaise,p.chips+p.bet),maxTo=p.chips+p.bet;const r=$('amt');r.min=minTo;r.max=maxTo;r.step=g.bb/2;r.value=minTo;$('amtN').value=minTo;
 $('bRaise').disabled=maxTo<=g.curBet;$('bRaise').textContent=g.curBet>0?'Korota':'Panosta';
 $('coach').innerHTML='Valmentaja laskee…';setTimeout(()=>{const eq=equity(p.hole,g.board,opp,2000);
  const adv=coachAdvice(eq,tc,g.pot(),p.chips,g.bb,opp,g.street,minTo,g.curBet,p.bet);adv.eq=eq;adv.sim=Object.assign({},equity.last);const P=q=>profileOf(q,q.style);const opps=g.players.filter(q=>!q.folded&&q!==p);
  const la=g.lastAggr!=null&&g.lastAggr!==0?g.players[g.lastAggr]:null;const steal=g.curBet===g.bb&&g.players.every(q=>q.human||q.bet<=g.bb)&&g.nextIdx(g.turn,q=>!q.folded&&!q.allin&&!q.human&&q.bet<g.bb)!==-1&&opps.length<=3;
  styleAdjust(adv,eq,{toCall:tc,pot:g.pot(),bb:g.bb,street:g.street,curBet:g.curBet,minRaiseTo:minTo,stack:p.chips,myBet:p.bet,aggrProf:la&&!la.folded?P(la):null,aggrName:la?la.name:'',opps:opps.map(P),fair:1/(opp+1),steal});
  adv.ctx={tc,pot:g.pot(),hole:p.hole,board:g.board.slice(),aggrName:la&&!la.folded?la.name:''};curAdvice=adv;
  if($('hints').checked)$('coach').innerHTML=adviceHTML(adv,opp);else $('coach').innerHTML='<i>Vihjeet piilossa – palaute käden jälkeen.</i>';},20);}
function advText(a){return ACTFI[a.action]+(a.amount&&grp(a.action)==='aggr'?' '+a.amount:'');}
function adviceHTML(a,opp){const c=a.ctx;let h=`<b>Equity:</b> ${pc(a.eq)} vs ${opp} vastustaja${opp>1?'a':''} · <b>Pottikertoimet:</b> ${a.potOdds?pc(a.potOdds):'—'}<br><small>Equity = (${a.sim.wins} voittoa + ${a.sim.ties} tasapeliä jaettuna osuuksiin) / ${a.sim.n} simulaatiota = ${(a.eq*100).toFixed(1)} %</small><br><b>Suositus: ${advText(a)}</b><br>${a.why}`;
 if(a.styleNotes&&a.styleNotes.length)h+=`<div class="sub">🎭 <b>Vastustajan tyyli${c.aggrName?' ('+c.aggrName+')':''}:</b> ${a.styleNotes.join(' ')}</div>`;
 if(c.tc>0){const ratio=(c.pot/c.tc).toFixed(1),ev=a.eq*(c.pot+c.tc)-c.tc;
  h+=`<div class="sub">➗ <b>Pottikerroin:</b> ${c.tc} / (${c.pot} + ${c.tc}) = <b>${pc(a.potOdds)}</b> eli ${ratio}:1. Tarvitset vähintään ${pc(a.potOdds)} equityn, sinulla on ${pc(a.eq)} → ${a.eq>=a.potOdds?'maksu on pitkällä aikavälillä <b>voitollinen</b>':'maksu on pitkällä aikavälillä <b>tappiollinen</b>'}.<br>
  EV-esimerkki: maksat ${c.tc} ja voitat ${c.pot+c.tc} (koko potti) ${pc(a.eq)} ajasta: EV ≈ ${pc(a.eq)} × ${c.pot+c.tc} − ${c.tc} = <b>${ev>=0?'+':''}${Math.round(ev)}</b> merkkiä per maksu. 100 samanlaisessa tilanteessa se tekee n. ${ev>=0?'+':''}${Math.round(ev*100)}.</div>`;}
 if(c.board.length===3||c.board.length===4){const o=computeOuts(c.hole,c.board);
  h+=`<div class="sub">🎯 <b>Outsit: ${o.count}</b> (nyt: ${o.cur})`+(o.count?'<br>'+Object.entries(o.groups).map(([k,v])=>`${k} (${v.length}): ${v.map(cardStr).join(' ')}`).join('<br>'):' – ei parantavia kortteja.')+
  `<br>Sääntö ${o.left>=2?'4 (flopilta riveriin)':'2 (seuraava kortti)'}: ${o.count} × ${o.left>=2?4:2} ≈ <b>${o.rule}%</b>. Tarkka: seuraava kortti ${pc(o.next)}${o.left>=2?`, riveriin mennessä ${pc(o.river)}`:''}.`+
  (c.tc>0?`<br>Vertailu: seuraavan kortin osumistodennäköisyys ${pc(o.next)} vs pottikerroin ${pc(a.potOdds)} → ${o.next>=a.potOdds?'pelkät outsit riittävät maksuun':'pelkät outsit eivät yksin riitä (huomioi mahdolliset tulevat voitot ja nykyinen käsi)'}.`:'')+`</div>`;}
 return h;}
function oppStats(p){if(!p.st||p.human)return '';const s=p.st,n=s.hands;if(!n)return '';const af=s.calls?(s.aggr/s.calls).toFixed(1):(s.aggr?'∞':'0');const pr=profileOf(p,p.style);
 return `<div class="ost" title="VPIP = vapaaehtoisesti pottiin preflop, PFR = preflop-korotus, AF = aggressiokerroin (panostukset+korotukset / maksut). ${pr.data?'Arvio havaintojen perusteella':'Vähän dataa (<8 kättä)'}"><span>VPIP ${Math.round(100*s.vpip/n)}</span><span>PFR ${Math.round(100*s.pfr/n)}</span><span>AF ${af}</span>${pr.data?'<span class="lbl">'+pr.label+'</span>':''}</div>`;}
function userAct(action){const g=G,p=g.players[0];if(g.over||g.players[g.turn]!==p||!curAdvice)return;let to=+$('amtN').value;
 if(action==='check'&&g.toCall(p)>0)action='call';if(action==='raise'&&to>=p.chips+p.bet)action='allin';if(action==='raise'&&g.curBet===0)action='bet';
 const a=curAdvice;curAdvice=null;const m=grp(a.action)===grp(action);stats.dec++;if(m)stats.match++;
 g.decisions.push({street:g.street,board:g.board.slice(),eq:a.eq,po:a.potOdds,adv:a,user:ACTFI[action]+(grp(action)==='aggr'?' '+(action==='allin'?p.chips+p.bet:to):''),m});
 $('controls').classList.add('off');$('coach').innerHTML='';g.act(p,action,to);}
function onHandEnd(g){stats.hands++;const sn={preflop:'Preflop',flop:'Flop',turn:'Turn',river:'River'};
 $('review').innerHTML='<h3>Käden arvio</h3>'+(g.decisions.length?g.decisions.map(d=>`<div class="${d.m?'ok':'bad'}">${d.m?'✅':'⚠️'} <b>${sn[d.street]}</b> ${d.board.map(cardStr).join(' ')} – Sinä: <b>${d.user}</b>, valmentaja: <b>${advText(d.adv)}</b><br><small>${d.adv.why}</small></div>`).join(''):'<i>Ei päätöksiä tässä kädessä.</i>')+'<p>'+g.result.join('<br>')+'</p>';
 render();$('next').disabled=false;openPanel('review');if(g.players[0].chips<=0)$('review').innerHTML+='<p><b>Pelimerkit loppuivat – aloita uusi sessio.</b></p>';else if(g.alive().length<2)$('review').innerHTML+='<p><b>Voitit kaikki pelimerkit! 🎉</b></p>';}
function newSession(){const n=+$('nb').value;G=new Game({nBots:n,stack:1000,sb:10,bb:20,delay:+$('spd').value,log,render,onUser,onHandEnd});stats={hands:0,dec:0,match:0,start:1000};$('log').innerHTML='';$('review').innerHTML='';nextHand();}
function nextHand(){$('next').disabled=true;$('review').innerHTML='';$('coach').innerHTML='';if(!G.startHand())$('next').disabled=false;}
function openPanel(t){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.t===t));document.querySelectorAll('.pane').forEach(p=>p.style.display=p.id==='p-'+t?'block':'none');}
window.onload=()=>{document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>openPanel(b.dataset.t));$('togP').onclick=()=>document.body.classList.toggle('noside');$('tutBtn').onclick=tutOpen;$('tutX').onclick=()=>$('tutM').style.display='none';openPanel('coach');$('bFold').onclick=()=>userAct('fold');$('bCheck').onclick=()=>userAct('check');$('bRaise').onclick=()=>userAct('raise');$('bAll').onclick=()=>userAct('allin');
 $('amt').oninput=()=>$('amtN').value=$('amt').value;$('amtN').oninput=()=>$('amt').value=$('amtN').value;
 document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{const g=G,p=g.players[0];const tc=g.toCall(p);let v=g.curBet+Math.round(+b.dataset.f*(g.pot()+tc)/g.bb)*g.bb;v=Math.max(+$('amt').min,Math.min(+$('amt').max,v));$('amt').value=$('amtN').value=v;});
 $('hints').onchange=()=>{if(curAdvice&&$('hints').checked)$('coach').innerHTML=adviceHTML(curAdvice,G.players.filter(q=>!q.folded&&q!==G.players[0]).length);};
 $('spd').onchange=()=>{if(G)G.o.delay=+$('spd').value;};$('next').onclick=nextHand;$('new').onclick=newSession;newSession();
 const hs=location.hash;if(hs.startsWith('#tut')){tutOpen();const k=hs.slice(5).replace(/q$/,'');if(TUTS[k]){tutStart(k);if(hs.endsWith('q')){TS.i=TS.items.findIndex(x=>x.q);tutShow();}}}};
