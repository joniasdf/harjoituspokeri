const RANKS='23456789TJQKA',SUITS='shdc',SUITSYM={s:'♠',h:'♥',d:'♦',c:'♣'};
function newDeck(){const d=[];for(const s of SUITS)for(let r=0;r<13;r++)d.push({r:r+2,s});return d;}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function cardStr(c){return (c.r===10?'10':RANKS[c.r-2])+SUITSYM[c.s];}
function parseCard(t){return {r:RANKS.indexOf(t[0].toUpperCase())+2,s:t[1]};}
// 5-card eval -> comparable number
function eval5(c){const rs=c.map(x=>x.r).sort((a,b)=>b-a);const fl=c.every(x=>x.s===c[0].s);
 let u=[...new Set(rs)],st=0;if(u.length===5){if(rs[0]-rs[4]===4)st=rs[0];else if(rs[0]===14&&rs[1]===5)st=5;}
 const cnt={};rs.forEach(r=>cnt[r]=(cnt[r]||0)+1);const g=Object.keys(cnt).map(Number).sort((a,b)=>cnt[b]-cnt[a]||b-a);const pat=g.map(r=>cnt[r]).join('');
 let cat,k;if(st&&fl){cat=8;k=[st];}else if(pat==='41'){cat=7;k=g;}else if(pat==='32'){cat=6;k=g;}else if(fl){cat=5;k=rs;}else if(st){cat=4;k=[st];}
 else if(pat==='311'){cat=3;k=g;}else if(pat==='221'){cat=2;k=g;}else if(pat==='2111'){cat=1;k=g;}else{cat=0;k=rs;}
 let v=cat;for(let i=0;i<5;i++)v=v*15+(k[i]||0);return v;}
function evalBest(cards){let best=-1;const n=cards.length;
 for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){const h=cards.filter((_,i)=>i!==a&&i!==b);if(n===7){const v=eval5(h);if(v>best)best=v;}}
 if(n===5)return eval5(cards);if(n===6){for(let a=0;a<6;a++){const v=eval5(cards.filter((_,i)=>i!==a));if(v>best)best=v;}}return best;}
const CATNAMES=['Hai kortti','Pari','Kaksi paria','Kolmoset','Suora','Väri','Täyskäsi','Neloset','Värisuora'];
function catName(v){return CATNAMES[Math.floor(v/Math.pow(15,5))];}
function equity(hole,board,nOpp,iters=1500){const used=new Set([...hole,...board].map(c=>c.r+c.s));const rest=newDeck().filter(c=>!used.has(c.r+c.s));let score=0,W=0,T=0;
 for(let it=0;it<iters;it++){const d=rest.slice();const need=5-board.length+2*nOpp;for(let i=0;i<need;i++){const j=i+Math.floor(Math.random()*(d.length-i));[d[i],d[j]]=[d[j],d[i]];}
  let p=0;const b=board.concat(d.slice(0,5-board.length));p=5-board.length;const me=evalBest(hole.concat(b));let best=0,ties=0,lose=false;
  for(let o=0;o<nOpp;o++){const v=evalBest([d[p],d[p+1]].concat(b));p+=2;if(v>me){lose=true;break;}if(v===me)ties++;}
  if(!lose){score+=1/(ties+1);if(ties)T++;else W++;}}
 equity.last={wins:W,ties:T,n:iters,eq:score/iters};return score/iters;}
// side pots: contributions [{id,amt,folded}] -> [{amount,eligible:[ids]}]
function buildPots(players){const lv=[...new Set(players.filter(p=>p.totalBet>0).map(p=>p.totalBet))].sort((a,b)=>a-b);let prev=0;const pots=[];
 for(const L of lv){let amt=0;players.forEach(p=>{amt+=Math.max(0,Math.min(p.totalBet,L)-prev);});const el=players.filter(p=>!p.folded&&p.totalBet>=L).map(p=>p.id);
  if(amt>0){if(pots.length&&el.join()===pots[pots.length-1].eligible.join())pots[pots.length-1].amount+=amt;else pots.push({amount:amt,eligible:el});}prev=L;}
 return pots;}
// coach recommendation
function coachAdvice(eq,toCall,pot,stack,bb,nOpp,street,minRaiseTo,curBet,myBet){
 const potOdds=toCall>0?toCall/(pot+toCall):0;const strongTh=Math.min(0.85,1.6/(nOpp+1)+0.1);let a,amt=0,why;
 const sizeBet=f=>Math.min(stack+myBet,Math.max(minRaiseTo,Math.round((curBet+ f*(pot+toCall))/bb)*bb||minRaiseTo));
 if(toCall===0){if(eq>=strongTh){a=curBet>0?'raise':'bet';amt=sizeBet(0.66);why=`Equitysi ${pc(eq)} on vahva ${nOpp} vastustajaa vastaan – panosta arvosta (n. 2/3 potista).`;}
  else if(eq>=1/(nOpp+1)+0.12&&street!=='preflop'){a='bet';amt=sizeBet(0.5);why=`Equity ${pc(eq)} on yli keskiarvon (${pc(1/(nOpp+1))}) – pieni arvopanos (1/2 potista).`;}
  else{a='check';why=`Equity ${pc(eq)} ei riitä panostamiseen – tarkista ilmaiseksi.`;}}
 else{if(eq>=strongTh&&stack>toCall){a='raise';amt=sizeBet(0.75);why=`Equity ${pc(eq)} selvästi yli pottikertoimien (${pc(potOdds)}) – korota arvosta.`;}
  else if(eq>=potOdds+0.03){a='call';why=`Equity ${pc(eq)} > pottikertoimet ${pc(potOdds)} – maksu on kannattava.`;}
  else{a='fold';why=`Equity ${pc(eq)} < pottikertoimet ${pc(potOdds)} – maksu on pitkällä aikavälillä tappiollinen, luovuta.`;}}
 if((a==='bet'||a==='raise')&&amt>=stack+myBet){a='allin';amt=stack+myBet;}
 return {action:a,amount:amt,potOdds,why};}
function pc(x){return Math.round(x*100)+'%';}
if(typeof module!=='undefined')module.exports={eval5,evalBest,parseCard,equity,buildPots,coachAdvice,catName};
function catOf(cards){if(cards.length>=5)return Math.floor(evalBest(cards)/Math.pow(15,5));const c={};cards.forEach(x=>c[x.r]=(c[x.r]||0)+1);const v=Object.values(c).sort((a,b)=>b-a);
 if(v[0]===4)return 7;if(v[0]===3)return 3;if(v[0]===2&&v[1]===2)return 2;if(v[0]===2)return 1;return 0;}
function computeOuts(hole,board){const used=new Set([...hole,...board].map(c=>c.r+c.s));const unseen=newDeck().filter(c=>!used.has(c.r+c.s));
 const cur=catOf(hole.concat(board));const groups={};let n=0;
 for(const c of unseen){const nb=board.concat([c]);const nc=catOf(hole.concat(nb));if(nc>cur&&nc>catOf(nb)){let k=CATNAMES[nc];if(nc===1&&cur===0)k='Pari (yliskortti/osuma)';(groups[k]=groups[k]||[]).push(c);n++;}}
 const u=unseen.length,left=5-board.length;const next=n/u,river=left>=2?1-(1-n/u)*(1-n/(u-1)):next;
 return {count:n,groups,unseen:u,cur:CATNAMES[cur],next,river,rule:left>=2?n*4:n*2,left};}
if(typeof module!=='undefined')Object.assign(module.exports,{computeOuts,catOf});
function profileOf(p,fallback){const s=p.st||{hands:0};const n=s.hands;let vp,pf,af;
 if(n>=8){vp=s.vpip/n;pf=s.pfr/n;af=s.calls?s.aggr/s.calls:s.aggr;}
 const loose=n>=8?vp>0.38:fallback==='loose',tight=n>=8?vp<0.24:fallback==='tight',aggr=n>=8?af>=2:fallback==='aggressive',passive=n>=8?af<1:fallback==='loose';
 return {n,vp,pf,af,loose,tight,aggr,passive,label:(tight?'tiukka':loose?'löysä':'keskitaso')+'-'+(aggr?'aggressiivinen':passive?'passiivinen':'tasapainoinen'),data:n>=8};}
function styleAdjust(adv,eq,ctx){// ctx:{toCall,pot,bb,street,curBet,minRaiseTo,stack,myBet,aggrProf,opps:[profiles],fair}
 const notes=[];const po=adv.potOdds;const A=ctx.aggrProf;
 if(ctx.toCall>0&&A){
  if(A.aggr){if(adv.action==='fold'&&eq>=po-0.05){adv.action='call';notes.push(`Hyökkääjä on aggressiivinen ja panostaa usein heikolla – voit maksaa kevyemmin (equity riittää lähes kertoimiin).`);}
   else if((adv.action==='raise')&&eq>0.65&&ctx.street!=='river'){adv.action='call';adv.amount=0;notes.push(`Vahva käsi aggressiivista vastaan: ansoita maksamalla ja anna hänen jatkaa panostamista.`);}
   else notes.push('Aggressiivinen vastustaja: älä bluffaa häntä, hän maksaa ja korottaa usein.');}
  else if(A.tight){if(adv.action==='call'&&eq<po+0.09){adv.action='fold';notes.push(`Tiukka pelaaja korottaa harvoin ilman vahvaa kättä – kunnioita panosta; todellinen equitysi on todennäköisesti laskettua pienempi.`);}
   else notes.push('Tiukan pelaajan panos kertoo yleensä vahvasta kädestä – ole varovainen.');}}
 if(ctx.toCall===0&&ctx.opps.length&&ctx.opps.every(o=>o.passive&&!o.tight)&&adv.action==='check'&&eq>=ctx.fair+0.03&&ctx.street!=='preflop'){
  adv.action='bet';adv.amount=Math.max(ctx.minRaiseTo,Math.round(ctx.pot*0.5/ctx.bb)*ctx.bb);notes.push('Löysä-passiiviset vastustajat maksavat heikoilla käsillä – ohut arvopanos kannattaa. Älä bluffaa heitä.');}
 if(ctx.street==='preflop'&&ctx.steal&&ctx.opps.length&&ctx.opps.every(o=>o.tight)&&(adv.action==='fold'||adv.action==='check'||adv.action==='call')&&eq>=ctx.fair-0.08){
  adv.action='raise';adv.amount=Math.min(ctx.stack+ctx.myBet,Math.max(ctx.minRaiseTo,ctx.bb*2.5));notes.push('Jäljellä vain tiukkoja pelaajia ja potti korottamaton – varasta blindit korotuksella, he luovuttavat usein.');}
 if(adv.amount>=ctx.stack+ctx.myBet&&adv.action!=='call')adv.action='allin';
 adv.styleNotes=notes;return adv;}
if(typeof module!=='undefined')Object.assign(module.exports,{profileOf,styleAdjust});
