import type { Grid } from "/cnctaopt/index.ts";
import { empty, layout } from "/addon/units.ts";
import { layoutSize } from "/defaults.ts";
import { populate } from "/power/optimize.ts";

export { default as calculate, isGreater } from "/power/calculate.ts";
export { default as optimize, populate, type } from "/power/optimize.ts";
export { default as seek } from "/power/seek.ts";
export { encode } from "/layout/index.ts";

export type Layout = Array<Unit>;
export type Tile = [unit: Unit, index: number, rate: number];
export type Unit = typeof units extends Set<infer T> ? T : never;

const { a, c, j, n, p, t } = layout;
const units = new Set( [empty, a, c, p, t] );

function isUnit( value: unknown ): value is Unit {
    return units.has( value as Unit );
}

function toUnit( unit: unknown ): Unit {
    if ( isUnit( unit ) ) return unit;
    if ( unit === j ) return t;
    if ( unit === n ) return c;
    return empty;
}

export function cast( grid: Grid  ) {
    return grid.slice(0, layoutSize + 1).map( ( [unit] ) => toUnit(unit) );
}

export function normalize( grid: Grid, clean?: boolean ) {
    const snap = cast( grid );
    const empty = clean ?? !snap.some( unit => unit === p || unit === a );
    return empty ? populate( snap ) : snap;
}

export function update( layout: Layout, from: Unit, to: Unit , count: number ) {
    const size = Math.min( layout.length, layoutSize );
    const snap = layout.slice()

    if ( count > 0 ) {
        for ( let index = 0; count !== 0 && index < size; index++ ) {
            if ( snap[index] === from ) {
                snap[index] = to;
                count -= 1;
            }
        }
    } else if ( count < 0 ) {
        for ( let index = 0; count !== 0 && index < size; index++ ) {
            if ( snap[index] === to ) {
                snap[index] = from;
                count += 1;
            }
        }
    }

    if ( count === 0 ) return snap;

    throw new Error("Not enough available tiles to replace");
}