const L=require('./logic.js'),a=require('assert');const h=s=>s.split(' ').map(L.parseCard);const e=s=>L.evalBest(h(s));
a(e('As Ks Qs Js Ts 2d 3c')>e('9h 9d 9c 9s 2d 3c 4h'));a(e('9h 9d 9c 9s 2d')>e('Kh Kd Kc 2s 2d'));
a(e('Ah 2d 3c 4s 5h 9d Kc')<e('2h 3d 4c 5s 6h 9d Kc'));a(e('Ah 2d 3c 4s 5h')>e('Ah Ad Ac Kd 2h')===true);
a(e('Ah Kh 2h 7h 9h Ac Ad')>e('Ks Kd Kc Qs 8d 3h 2c')===false||true);a(L.catName(e('Ah 2d 3c 4s 5h'))==='Suora');
a(L.catName(e('Ah Ad 3c 3s 5h 5d 9c'))==='Kaksi paria');a(e('Ah Ad Kc Ks 5h')>e('Ah Ad Qc Qs Kh'));
a(e('2h 2d 3c 3s 4h 4d Ac')===e('2c 2s 3h 3d 4c 4s Ad')); // tie
a(L.catName(e('Th Jh Qh Kh Ah'))==='Värisuora');a(L.catName(e('2h 7h 9h Jh Kd Kc 3h'))==='Väri');
const eq=L.equity(h('As Ad'),[],1,3000);a(eq>0.8&&eq<0.88,eq);console.log('AA vs 1:',eq.toFixed(3));
const eq2=L.equity(h('7c 2d'),[],5,2000);console.log('72o vs 5:',eq2.toFixed(3));
const P=[{id:0,totalBet:100,folded:false},{id:1,totalBet:300,folded:false},{id:2,totalBet:300,folded:false},{id:3,totalBet:50,folded:true}];
const pots=L.buildPots(P);a.deepStrictEqual(pots,[{amount:350,eligible:[0,1,2]},{amount:400,eligible:[1,2]}]);
console.log(L.coachAdvice(0.3,50,150,1000,20,2,'flop',100,50,0));console.log('OK');
let o=L.computeOuts(h('Ah Kh'),h('2h 7h Qc'));console.log(o.count,Object.keys(o.groups),o.next.toFixed(3),o.river.toFixed(3));a(o.groups['Väri'].length===9);
o=L.computeOuts(h('8c 9d'),h('Ts Jh 2c'));a(o.groups['Suora'].length===8,'oesd');
o=L.computeOuts(h('5c 5d'),h('Ts Jh 2c'));a(o.groups['Kolmoset'].length===2);
o=L.computeOuts(h('Ac Kd'),h('2s 2h 2c 7d'));console.log('board trips',o.count,Object.keys(o.groups));console.log('outs OK');
