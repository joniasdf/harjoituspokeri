const pp=require('puppeteer-core');(async()=>{const b=await pp.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],headless:'new'});
const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+process.argv[2]);await p.waitForSelector('#tutBtn');await p.click('#tutBtn');
const keys=await p.evaluate(()=>TUT_ORDER);let mcCount=0;
for(const k of keys){await p.evaluate(k=>tutStart(k),k);let steps=0;
 while(steps++<20){const st=await p.evaluate(()=>{const it=TS&&TS.items[TS.i];return it?{q:!!it.q,opts:it.q&&it.q.opts?it.q.opts.length:0,yn:it.q&&it.q.yn,ans:it.q?it.q.ans:null}:null});
  if(!st)break;
  if(st.q){if(st.opts){mcCount++;const btns=await p.$$('#tutB .tbtn');await btns[(st.ans+1)%st.opts].click();}
   else if(st.yn){const btns=await p.$$('#tutB .tbtn');await btns[st.ans?0:1].click();}
   else{await p.type('#tutIn',String(+st.ans.toFixed(2)).replace('.',','));await (await p.$$('#tutB .tbtn'))[0].click();}
   await p.waitForSelector('#tutF .tbtn',{timeout:2000});await p.click('#tutF .tbtn');}
  else{const bs=await p.$$('#tutB .tbtn');await bs[0].click();}
  if(await p.evaluate(()=>/valmis!/.test(document.getElementById('tutB').innerHTML)))break;}
 const done=await p.evaluate(()=>/valmis!/.test(document.getElementById('tutB').innerHTML));if(!done)throw new Error('tutorial not completed: '+k);
 console.log('✓',k,await p.evaluate(()=>document.querySelector('#tutB p').textContent));}
await p.evaluate(()=>tutMenu());const menu=await p.evaluate(()=>document.querySelectorAll('.tlist li').length+' '+document.querySelector('.prog').textContent);console.log(menu);
await p.screenshot({path:'/workspace/poker-trainer/shot_tutmenu_done.png'});
console.log('mc clicked',mcCount,'errors',errs);await b.close();if(errs.length)process.exit(1);})().catch(e=>{console.error(e);process.exit(1)});
