import type { Grid } from "/cnctaopt";
import { empty, layout } from "/addon/units.ts";
import { layoutSize } from "/defaults.ts";

export { add, find, setState, type Filters } from "/layout/layouts.ts";
export { default as calculate, type Readings } from "/layout/calculate.ts";
export { default as offsets } from "/layout/offsets.ts";
export { get, set, score, type Type } from "/layout/readings.ts";

export type Layout = Array<Unit>;
export type Tile = [unit: Unit, index: number, rate: number];
export type Unit = typeof units extends Set<infer T> ? T : never;

const { a, c, j, n, p, r, s, t } = layout;
const units = new Set( [empty, a, c, j, n, p, r, s, t] );
const keys = Object.fromEntries( units.values().map((unit, index) => [unit, index]));
const tech = new Set<Unit>( [a, j, n, p, r, s] );

function add( value: bigint, unit: string ) {
    return value * 9n + BigInt( keys[unit]! );
}

export function isUnit( value: unknown ): value is Unit {
    return units.has( value as Unit );
}

export function hash( layout: Layout ): string {
    const techs = { a: 0, j: 0, n: 0, p: 0, r: 0, s: 0 };
    const size = Math.min(layout.length, layoutSize);

    let hash = "";

    for (let index = 0; index < size; index += 1) {
        const unit = layout[index]!;
        
        if (unit === c || unit === n) {
            hash += `${index}c`; // Crystal resource
        } else if (unit === t || unit === j) {
            hash += `${index}t`; // Tiberium resource
        }
        
        if ( tech.has(unit) ) {
            techs[unit as keyof typeof techs] += 1;
        }
    }

    return `${hash}${techs.p}p${techs.a}a${techs.j}j${techs.n}n${techs.r}r${techs.s}s`;
}

export function encode( layout: Layout ): string {
    return layout.reduce(add, 0n).toString(36);
}

export function decode( encoded: string, length = layoutSize + 1 ): Layout {
    const values = [...units];
    const layout: Layout = [];

    // Parse base-36 string to bigint
    let value = 0n;

    for (const char of encoded) {
        value = value * 36n + BigInt(parseInt(char, 36));
    }

    // Extract each unit (base-9 digits, LSB first)
    while (value > 0n) {
        layout.unshift(values[Number(value % 9n)]!);
        value = value / 9n;
    }

    // Pad with empty units at the start to reach expected length
    while (layout.length < length) {
        layout.unshift(empty);
    }

    return layout;
}

export function cast( grid: Grid ) {
    return grid.slice(0, layoutSize + 1).map( ([unit]) => isUnit(unit) ? unit : empty );
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

