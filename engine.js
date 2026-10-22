const STYLES={tight:{name:'Tiukka',loose:-0.08,aggr:0.15,bluff:0.03},loose:{name:'Löysä',loose:0.12,aggr:0.2,bluff:0.08},aggressive:{name:'Aggressiivinen',loose:0.05,aggr:0.55,bluff:0.2}};
class Game{
 constructor(o){this.o=o;this.sched=o.sched||((f,ms)=>setTimeout(f,ms));this.sb=o.sb||10;this.bb=o.bb||20;this.dealer=-1;this.handNo=0;
  const names=['Aino','Ville','Kaisa','Pekka','Liisa'],st=['tight','loose','aggressive','tight','aggressive'];
  this.players=[{id:0,name:'Sinä',human:true,chips:o.stack||1000}];for(let i=0;i<o.nBots;i++)this.players.push({id:i+1,name:names[i],style:st[i],chips:o.stack||1000});
  this.log=o.log||(()=>{});this.render=o.render||(()=>{});this.onUser=o.onUser||(()=>{});this.onHandEnd=o.onHandEnd||(()=>{});}
 alive(){return this.players.filter(p=>p.chips>0);}
 nextIdx(i,f){const n=this.players.length;for(let k=1;k<=n;k++){const j=(i+k)%n;if(f(this.players[j]))return j;}return -1;}
 startHand(){const pl=this.players;if(pl[0].chips<=0||this.alive().length<2)return false;this.handNo++;
  pl.forEach(p=>{p.hole=[];p.bet=0;p.totalBet=0;p.folded=p.chips<=0;p.st=p.st||{hands:0,vpip:0,pfr:0,aggr:0,calls:0};if(p.chips>0)p.st.hands++;p.fv=p.fp=false;p.out=p.chips<=0;p.allin=false;p.acted=false;p.lastAct='';});
  this.dealer=this.nextIdx(this.dealer,p=>!p.out);this.deck=shuffle(newDeck());this.board=[];this.street='preflop';this.decisions=[];this.over=false;this.winners=[];this.lastAggr=null;
  const inH=pl.filter(p=>!p.out);inH.forEach(p=>p.hole=[this.deck.pop(),this.deck.pop()]);
  let sbI,bbI;if(inH.length===2){sbI=this.dealer;bbI=this.nextIdx(sbI,p=>!p.out);}else{sbI=this.nextIdx(this.dealer,p=>!p.out);bbI=this.nextIdx(sbI,p=>!p.out);}
  this.sbI=sbI;this.bbI=bbI;this.post(pl[sbI],this.sb,'PB');this.post(pl[bbI],this.bb,'IB');this.curBet=this.bb;this.minRaise=this.bb;
  this.log(`— Käsi #${this.handNo} — jakaja ${pl[this.dealer].name}`);this.turn=this.nextIdx(bbI,p=>!p.folded&&!p.allin);this.proceed();return true;}
 post(p,a,l){a=Math.min(a,p.chips);p.chips-=a;p.bet+=a;p.totalBet+=a;if(p.chips===0)p.allin=true;p.lastAct=l+' '+a;}
 pot(){return this.players.reduce((s,p)=>s+p.totalBet,0);}
 toCall(p){return Math.min(this.curBet-p.bet,p.chips);}
 act(p,action,to){if(this.over||this.players[this.turn]!==p)return;const call=this.toCall(p);
  if(action==='check'&&call>0)action='call';
  if(action==='fold'){p.folded=true;p.lastAct='Luovutus';}
  else if(action==='check'){p.lastAct='Tarkistus';}
  else if(action==='call'){this.post(p,call,'Maksu');if(call===0)p.lastAct='Tarkistus';}
  else{ // bet/raise/allin: to = total bet level
   let maxTo=p.bet+p.chips;if(action==='allin')to=maxTo;to=Math.min(Math.max(to,this.curBet+this.minRaise),maxTo);
   if(to<=this.curBet){this.post(p,call,'Maksu');}else{const inc=to-this.curBet;const full=inc>=this.minRaise;const wasBet=this.curBet===0;
    this.post(p,to-p.bet,p.chips===to-p.bet?'All-in':(wasBet?'Panostus':'Korotus'));if(p.allin)p.lastAct='All-in '+to;
    if(full){this.minRaise=inc;this.players.forEach(q=>{if(q!==p)q.acted=false;});}this.curBet=to;}}
  this.track(p,action,call);p.acted=true;this.log(`${p.name}: ${p.lastAct}`);this.advance();}
 track(p,a,call){const s=p.st,ag=a==='bet'||a==='raise'||a==='allin',isC=a==='call'&&call>0;
  if(ag&&p.lastAct.startsWith('Maksu')){if(call>0)s.calls++;}else if(ag){s.aggr++;this.lastAggr=p.id;}else if(isC)s.calls++;
  if(this.street==='preflop'&&(ag||isC)){if(!p.fv){p.fv=true;s.vpip++;}if(ag&&!p.fp&&!p.lastAct.startsWith('Maksu')){p.fp=true;s.pfr++;}}}
 advance(){const pl=this.players,live=pl.filter(p=>!p.folded);
  if(live.length===1)return this.finish();
  const canAct=live.filter(p=>!p.allin);const done=canAct.every(p=>p.acted&&p.bet===this.curBet);
  if(done){return this.nextStreet();}
  this.turn=this.nextIdx(this.turn,p=>!p.folded&&!p.allin&&(!p.acted||p.bet<this.curBet));this.proceed();}
 nextStreet(){const pl=this.players;pl.forEach(p=>{p.bet=0;p.acted=false;});this.curBet=0;this.minRaise=this.bb;
  if(this.street==='river')return this.finish();
  const n={preflop:3,flop:1,turn:1}[this.street];this.street={preflop:'flop',flop:'turn',turn:'river'}[this.street];
  for(let i=0;i<n;i++)this.board.push(this.deck.pop());this.log(`${{flop:'Flop',turn:'Turn',river:'River'}[this.street]}: ${this.board.map(cardStr).join(' ')}`);
  const canAct=pl.filter(p=>!p.folded&&!p.allin);if(canAct.length<=1){this.render();return this.sched(()=>this.nextStreet(),this.o.delay??700);}
  this.turn=this.nextIdx(this.dealer,p=>!p.folded&&!p.allin);this.proceed();}
 proceed(){this.render();const p=this.players[this.turn];if(p.human)this.onUser(p);else this.sched(()=>this.botAct(p),this.o.delay??700);}
 finish(){const pl=this.players,live=pl.filter(p=>!p.folded);this.over=true;const res=[];
  if(live.length===1){const w=live[0];const a=this.pot();w.chips+=a;res.push(`${w.name} voittaa ${a} (muut luovuttivat)`);this.winners=[w.id];}
  else{while(this.board.length<5)this.board.push(this.deck.pop());live.forEach(p=>p.score=evalBest(p.hole.concat(this.board)));
   for(const pt of buildPots(pl)){const el=pt.eligible.map(i=>pl[i]);const best=Math.max(...el.map(p=>p.score));const ws=el.filter(p=>p.score===best);
    const share=Math.floor(pt.amount/ws.length);let rem=pt.amount-share*ws.length;ws.forEach(w=>{w.chips+=share+(rem-->0?1:0);this.winners.push(w.id);});
    res.push(`${ws.map(w=>w.name).join(' & ')} voittaa ${pt.amount} (${catName(best)})`);}}
  res.forEach(r=>this.log(r));this.result=res;this.render();this.onHandEnd(this);}
 botAct(p){const st=STYLES[p.style];const opp=this.players.filter(q=>!q.folded&&q!==p).length;
  const eq=equity(p.hole,this.board,opp,250);const call=this.toCall(p),pot=this.pot();const po=call>0?call/(pot+call):0;
  const fair=1/(opp+1),adj=eq+st.loose*(this.street==='preflop'?1:0.5),r=Math.random();
  const raiseTo=f=>this.curBet+Math.max(this.minRaise,Math.round(f*(pot+call)/this.bb)*this.bb);
  if(adj>fair*1.6+0.1-st.aggr*0.1||(r<st.bluff&&opp<=2)){if(r<st.aggr+0.3)return this.act(p,call===0?'bet':'raise',raiseTo(0.5+st.aggr*0.6+Math.random()*0.3));}
  if(call===0)return this.act(p,(adj>fair+0.05&&r<st.aggr)?'bet':'check',raiseTo(0.5));
  if(adj>=po+0.02-(call<=this.bb?0.08:0))return this.act(p,'call');return this.act(p,'fold');}
}
if(typeof module!=='undefined')module.exports={Game,STYLES};
