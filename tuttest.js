const vm=require('vm'),fs=require('fs'),a=require('assert');const store={};const ctx={console,localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]}};vm.createContext(ctx);
vm.runInContext(['logic.js','tut.js','tut2.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+`;var __={TUTQ,TUTS,checkAns,TUT_ORDER,handTier,tutSave,tutProg};`,ctx);
const {TUTQ,TUTS,checkAns,TUT_ORDER,handTier}=ctx.__;
for(let i=0;i<1500;i++)for(const k in TUTQ){const q=TUTQ[k]();a(q.q&&q.sol,k);
 if(q.opts){a(q.ans>=0&&q.ans<q.opts.length,k);a(checkAns(q,q.ans));a(!checkAns(q,(q.ans+1)%q.opts.length));a(new Set(q.opts).size===q.opts.length,k+' dup');}
 else if(q.yn){a(checkAns(q,q.ans));a(!checkAns(q,1-q.ans));}else{a(checkAns(q,String(q.ans.toFixed(2)).replace('.',',')),k);a(!checkAns(q,q.ans+q.tol*2+1),k);}}
for(const k of TUT_ORDER){a(TUTS[k],k);TUTS[k].qs.forEach(g=>a(TUTQ[g],g));a(TUTS[k].qs.length>=3&&TUTS[k].qs.length<=5);}
a(handTier(14,14,false)===0&&handTier(13,11,false)===2&&handTier(6,6,false)===1&&handTier(7,2,false)===3&&handTier(9,10,true)===2);
// winner validator vs evaluator
const q=TUTQ.winner();a(q.opts.length===3);
ctx.__.tutSave('rules',4,5);ctx.__.tutSave('rules',2,5);a(ctx.__.tutProg().rules.best===4);
console.log('tutorials OK',TUT_ORDER.length,'tutoriaalia,',Object.keys(TUTQ).length,'kysymystyyppiä');
