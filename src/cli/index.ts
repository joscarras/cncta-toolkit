import { parse, from, cast, create, print } from "/cnctaopt/index.ts";
import * as Layout from "/layout/index.ts";
import * as Power from "/power/index.ts";
import { optimize } from "/power/optimize.ts";

/** Camp */
// const url = "https://www.cnctaopt.com/index.html?ver=3~F~G~Base~..44r44s....44y.t.43j43s43rt44r...44s43s44o.t43u43q.44n.cc.44r43r.43v.44s...43o44j43s.44v..43n43s44r44r43r.44n...43s43j44j....44w..43s43s.43s44q.44q.44z44c.43gl.hh43cl44s43f43i44q44r43t43t43t43tk43p.k44q.44gk43i.44gl43i.ll.43oh44c43il44w44w44wk43w43w43w43m44q43m.44i.jj43d..43gkk43w43w43w43qh....................................~E=old~X=461~Y=468~WID=73~WN=World%2033%20(Europe)~ML=65";

/** Jos26 */ 
// const url = "https://www.cnctaopt.com/index.html?ver=3~G~G~JO%2026~54p60a65p50y.....65p65a65p65a.64q.63e.65pc65pt65ptt..65p65a65p65a65p65a65p..65pc65pc65pc65pt.65pc65pc65pc65p..65p65a65p65a65p65a65pt.65p65d65p65b65p65f...j64q64z64q64z64q64z64q64zj64q64z64q64z64q64z64qk64zk64s64q64slll64z64q64zh64q64z64q64z64qh64z64s64q64z64q64z64sl64q64zh64qh64sj64z64q64z64q64z64sh64q64z64s64qj64zj64q64z64q64zll.60s59s58s57s58z....61a60a59a58a.....62k62j59v60v60o....63c58i61f59o.....~E=old~X=498~Y=517~WID=73~WN=World%2033%20(Europe)~ML=65";

/** Camp */
// const url = "https://www.cnctaopt.com/index.html?ver=3~F~N~Camp~.13q...13s.13y......13n....cc...........cc.....13j.c..13w.t13r13u......13j.t.t.t...13s.......13i.....13ij..13m13z..13i.13ol...hh.j..jj......13q....jj.13q..lll.13i.13i..13w13w13wkkk.kkk.....13i12s12s12s12z.......................12c12i.......~E=old~X=461~Y=518~WID=73~WN=World%2033%20(Europe)~ML=65";

/** Jo04 */
const url = "https://www.cnctaopt.com/index.html?ver=3~G~G~JO%2002~...49y63p64p63p58w..t.t63p65a63pt..t63p63p63pt63p63p65p.65p65a65p59q.65p65a65p.65pc65p..65pc65p.65p65a65p62et65pc65p.65pc65p.t65pc65p.57b.60f.60d65p65a65p59z59q59z59q59z59q59z59q59z59q59z59qj59q59z59q59z59qj59sh59zk59slll59z59q59z59q59z59q.59q59zhhh59sll59s59zh59q59z59q59z59q59z59qj59z59z59s59qh59sl59z59s59qk59q59z59q59z59q59z59qk59s58s58s57s57z....60a59a58a57a.....60k62j58v60v60o....62c57i56f57o.....~E=old~X=481~Y=519~WID=73~WN=World%2033%20(Europe)~ML=65";
const new_layout = "https://www.cnctaopt.com/index.html?ver=3~G~G~JO%2002~....40p40p40p...t40pt40p40a40pt..t40p40a40pt40p40p40p..40p40p40p.40p40a40p.40pc40p..40pc40p.40p40a40p.t40pc40p.40pc40p.t40pc40p......40p40a.............................................................................................................~E=old~X=481~Y=519~WID=73~WN=World%2033%20(Europe)~ML=65";
const old_layout = "https://www.cnctaopt.com/index.html?ver=3~G~G~JO%2002~....40p40p40p...t40pt40p40a40pt..t40a40p.t40p40p40p.40p40p40p..40p40a40p.40pc40p..40pc40p.40p40a40p.t40pc40p.40pc40p.t40pc40p......40p40a40p............................................................................................................~E=old~X=481~Y=519~WID=73~WN=World%2033%20(Europe)~ML=65";
// 10t12t16t19t23t38c43c50t52c56c59t61c28p5a0j0n0r0s

// console.log( Power.seek( Power.parse(url) ) );
console.time("parse");
const data = parse( url );
console.timeEnd("parse");

console.time("calculate");
const base = Layout.calculate( Layout.cast( data.grid ) );
console.timeEnd("calculate");

console.time("optimize");
const optimized = Power.optimize( Power.normalize( data.grid ) );
// const optimized = old.optimize( old.parse( url ) );
// const optimized = Power.optimize( temp as any );
console.timeEnd("optimize");

console.log( "optimize", Power.normalize( data.grid ), "\n" );
console.log( "optimize", optimize( Power.normalize( data.grid ) ), "\n" );


console.time("seek");
// const optimal = Power.seek( Power.normalize( data.grid ) );
console.timeEnd("seek");

// console.log( Print.grid( data.grid ).join("\n"), "\n" );
// console.log( Print.layout( Power.cast( data.layout ) ).join("\n"), "\n" );
// console.log( "optimized", "\n" + print( optimized.layout ).join("\n"), "\n" );
// console.log( "optimized", optimized, "\n" );
// console.log( "optimal", "\n" + print( optimal.layout ).join("\n"), "\n" );
// console.log( "base", readings.totalPower, "\n" );
// console.log( "optimized", optimized.totalPower, "\n" );
// console.log( "optimal", optimal.totalPower, "\n" );
// console.log( "url", create( { ...data, grid: cast( optimized.layout ) }), "\n" );
// console.log( "url", from( optimal.layout, data.coords ), "\n" );
// console.log( readings, "\n" );
// console.log( optimized, "\n" );
// console.log( update( url, cast( optimized.layout ) ), "\n" );

// console.log( Print.layout( seek.layout ).join("\n"), "\n" );
// console.log( encode( seek.layout ), "\n" );

// process();
