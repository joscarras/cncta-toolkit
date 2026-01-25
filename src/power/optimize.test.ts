import { encode, calculate, decode } from "/layout/index.ts";
import { optimize, cast, populate } from "/power/optimize.ts";
import { from, parse } from "/cnctaopt/index.ts";
import { test, expect, describe } from "bun:test";
import { url } from "node:inspector";

const trials = 5;
const timings = new Map<number, number[]>();

const bases = [
    {
        url: "https://www.cnctaopt.com/index.html?ver=3~G~G~JO%2026~54p60a65p50y.....65p65a65p65a.64q.63e.65pc65pt65ptt..65p65a65p65a65p65a65p..65pc65pc65pc65pt.65pc65pc65pc65p..65p65a65p65a65p65a65pt.65p65d65p65b65p65f...j64q64z64q64z64q64z64q64zj64q64z64q64z64q64z64qk64zk64s64q64slll64z64q64zh64q64z64q64z64qh64z64s64q64z64q64z64sl64q64zh64qh64sj64z64q64z64q64z64sh64q64z64s64qj64zj64q64z64q64zll.60s59s58s57s58z....61a60a59a58a.....62k62j59v60v60o....63c58i61f59o.....~E=old~X=498~Y=517~WID=73~WN=World%2033%20(Europe)~ML=65",
        hash: "yzml9y2lpybwdgp4is1h2171251ay9ekaood9b7p6w29",
        totalPower: 81.8,
    },
    {
        url: "https://www.cnctaopt.com/index.html?ver=3~N~N~BLX%2003~...25y.....42p43p42pt44pt.t.45p57a47p56a50p43p51p..52pc50pc48p57a51pc.52pc50pc52pt47pc52p45p56a55p48p45p57a47p60a44p42p44pc57a43pt46p43p42p..45p47p46p....h............h...k..h.h...k...11q.l.j.11zkk...11zj..11s.h11s..11s.kk11z..11zll11z11q11qll11q11q11q11q11q12s12s12s12z.......................12c12i.......~E=old~X=462~Y=522~WID=73~WN=World%2033%20(Europe)~ML=65",
        hash: "5xwp5hp8y688bcbxr345yrj3c78z6i91ux5z5mi",
        totalPower: 91,
    },
    {
        url: "https://www.cnctaopt.com/index.html?ver=3~G~G~JO%2002~...49y63p64p63p58w..t.t63p65a63pt..t63p63p63pt63p63p65p.65p65a65p59q.65p65a65p.65pc65p..65pc65p.65p65a65p62et65pc65p.65pc65p.t65pc65p.57b.60f.60d65p65a65p59z59q59z59q59z59q59z59q59z59q59z59qj59q59z59q59z59qj59sh59zk59slll59z59q59z59q59z59q.59q59zhhh59sll59s59zh59q59z59q59z59q59z59qj59z59z59s59qh59sl59z59s59qk59q59z59q59z59q59z59qk59s58s58s57s57z....60a59a58a57a.....60k62j58v60v60o....62c57i56f57o.....~E=old~X=481~Y=519~WID=73~WN=World%2033%20(Europe)~ML=65",
        hash: "7i6ze1n7f9tpb8dee3ard8rekrimf58icecmxkzl4w",
        totalPower: 71.2,
    }
];

const camps = [
    {
        url: "https://www.cnctaopt.com/index.html?ver=3~F~G~Camp~..........t.c......t....t.......tt.....c......t.c...........ccc........................ll.....kk.....l.....kl..hhh....k....l......hh...l..j..kk.60s59s58s57s57z....60a59a58a57a.....59k60j59v60v60o....62c57i50f59o.....~E=old~X=494~Y=516~WID=73~WN=World%2033%20(Europe)~ML=65",
        hash: "1vn1ehbakceypd80jpz0wr445vw3t0dv2aqz209ou5w",
        totalPower: 86.1,
    },
    {
        url: "https://www.cnctaopt.com/index.html?ver=3~F~N~Camp~.13q...13s.13y......13n....cc...........cc.....13j.c..13w.t13r13u......13j.t.t.t...13s.......13i.....13ij..13m13z..13i.13ol...hh.j..jj......13q....jj.13q..lll.13i.13i..13w13w13wkkk.kkk.....13i12s12s12s12z.......................12c12i.......~E=old~X=461~Y=518~WID=73~WN=World%2033%20(Europe)~ML=65",
        hash: "z1i8cnld1x95ojevlg1qwbi6u6tszsrd0rcljkk2o6r0",
        totalPower: 87,
    },
    {
        url: "https://www.cnctaopt.com/index.html?ver=3~F~G~Base~...........t.c.t......c......t...tt.............c..cc..t.c..............l..........ll..kk..k..........h.j...kk.........j.j....hh....jjj....k....40s40s40s40s40z....40a40a40a40a.....40k40j40v40v40o....40c40i40f40o.....~E=old~X=477~Y=515~WID=73~WN=World%2033%20(Europe)~ML=65",
        hash: "1qao90qyiwlpzob2cf67sl1vp97u0wpckxrfn4gqfr0",
        totalPower: 86.3,
    },
    {
        url: "https://www.cnctaopt.com/index.html?ver=3~F~G~Outpost~.45v....45s...44n.45j45v45n44s44n..45s45v45s45s.45s45n44s45y.45n45v45j44v45s45v.44r....45o44n.45q.tt45r45r44s45v...45r45r44r44j..t..45w45u...45r..45i..45i.45s..kl.45z.k45d.44q..45sj45tk.h45ilj44q..45ij45dk.45q45fl.45ej.45q..45m.45p.45i..45sll44w44wl.45gj45i45o.44i.45ij45qj.40s40s40s40s40z....40a40a40a40a.....40k40j40v40v40o....40c40i40f40o.....~E=old~X=482~Y=512~WID=73~WN=World%2033%20(Europe)~ML=65",
        hash: "z1i83575xm11ug9kn3dj0nc9w5iit43e7yxntwyu8fr0",
        totalPower: 87,
    },
];

// Trial 1 - Duration: 3913.46ms Mean: 652.24ms
// Trial 2 - Duration: 3691.96ms Mean: 615.33ms
// Trial 3 - Duration: 3686.00ms Mean: 614.33ms
// Trial 4 - Duration: 3699.42ms Mean: 616.57ms
// Trial 5 - Duration: 3685.82ms Mean: 614.30ms

// Trial 1 - Duration: 3581.26ms Mean: 596.88ms
// Trial 2 - Duration: 3519.33ms Mean: 586.56ms
// Trial 3 - Duration: 3666.72ms Mean: 611.12ms
// Trial 4 - Duration: 3583.66ms Mean: 597.28ms
// Trial 5 - Duration: 3665.65ms Mean: 610.94ms

// Trial 1 - Duration: 3819.72ms Mean: 636.62ms
// Trial 2 - Duration: 3771.79ms Mean: 628.63ms
// Trial 3 - Duration: 3720.88ms Mean: 620.15ms
// Trial 4 - Duration: 3672.10ms Mean: 612.02ms
// Trial 5 - Duration: 3811.01ms Mean: 635.17ms

describe("Power optimization", () => {
    for (let trial = 1; trial <= trials; trial++) {
        describe(`Trial ${trial}`, () => {
            timings.set(trial, []);
            
            bases.forEach(({ url, hash, totalPower }, index) => {
                const { name, grid, coords } = parse(url);

                test(`Base ${index + 1} ${name}`, () => {
                    const start = performance.now();
                    const data = calculate(optimize(cast(grid)));
                    const duration = performance.now() - start;

                    timings.get(trial)!.push(duration);
                    expect(encode(data.layout)).toBe(hash);
                    expect(data.totalPower).toBeCloseTo(totalPower, 1);
                    expect(encode(data.layout)).toBe(hash);
                    expect(from(decode(hash), coords )).toBeString();
                    expect(from(data.layout, coords )).toBeString();
                });
            });

            camps.forEach(({ url, hash, totalPower }, index) => {
                const { name, grid, coords } = parse(url);

                test(`${name} ${index + 1}`, () => {
                    const start = performance.now();
                    const data = calculate(optimize( populate( cast(grid) )));
                    const duration = performance.now() - start;

                    timings.get(trial)!.push(duration);
                    expect(encode(data.layout)).toBe(hash);
                    expect(data.totalPower).toBeCloseTo(totalPower, 1);
                    expect(encode(data.layout)).toBe(hash);
                    expect(from(decode(hash), coords )).toBeString();
                    expect(from(data.layout, coords )).toBeString();
                });
            });
        });
    }
});

describe("Performance Summary", () => {
    test("all trial durations", () => {
        for (const [trial, values] of timings.entries()) {
            const duration = values.reduce((sum, time) => sum + time, 0);
            const mean = duration / values.length;

            console.log(
                `Trial ${trial} - Duration: ${duration.toFixed(2)}ms`,
                `Mean: ${mean.toFixed(2)}ms`
            );
        }
    });
});