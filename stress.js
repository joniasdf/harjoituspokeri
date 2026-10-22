const vm=require('vm'),fs=require('fs');const ctx={console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('logic.js','utf8')+fs.readFileSync('engine.js','utf8')+`
equity=()=>Math.random();let tot=0,maxSteps=0;
for(let s=0;s<300;s++){const nb=3+s%3;const q=[];let g;g=new Game({nBots:nb,delay:0,sched:f=>q.push(f),onUser:p=>q.push(()=>{const r=Math.random(),tc=g.toCall(p);
 const a=r<.2?'fold':r<.5?'call':r<.6?'check':r<.8?'raise':r<.9?'allin':'bet';g.act(p,a,g.curBet+Math.floor(Math.random()*300));})});
 for(let k=0;k<200;k++){if(!g.startHand())break;let n=0;while(q.length&&n++<2000)q.shift()();if(!g.over)throw 'stuck s'+s+' k'+k;maxSteps=Math.max(maxSteps,n);tot++;
 const t=g.players.reduce((a,p)=>a+p.chips,0);if(t!==1000*(nb+1))throw 'chips';}}
console.log('stress hands',tot,'max steps/hand',maxSteps);`,ctx);
