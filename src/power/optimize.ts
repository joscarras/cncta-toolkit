import calculate, { isGreater } from "/power/calculate.ts";
import layouts from "/power/layouts";
import type { Layout, Tile, Unit } from "/power/index.ts";
import { empty, layout } from "/addon/units.ts";
import { layoutSize, maxUnits } from "/defaults.ts";
import { offsets, hash, set, get } from "/layout/index.ts";
import { print } from "/cnctaopt";

export const type = "power" as const;
export { cast } from "/power/index.ts";

const { a, c, p, t } = layout;

function sortByRate( lhs: Tile, rhs: Tile ) {
    if ( lhs[2] < 0 || rhs[2] < 0 ) return 1;
    return rhs[2] - lhs[2] || lhs[1] - rhs[1];
}

function* getTiles( layout: Layout, size: number, clear = false ) {
    for ( let index = 0; index <= size; index += 1 ) {
        const unit = layout[index]!;
        
        if ( unit === c || unit === t ) {
            yield [unit, index, -1] as Tile;
        } else {
            let rate = 0;

            for ( const offset of offsets[index]! ) {
                const next = layout[offset];

                if ( next === c ) {
                    rate += 1;
                } else if ( next === a ) {
                    rate += 2;
                }
            }

            if ( unit === p || clear ) {
                yield [empty, index, rate] as Tile;
            } else {
                yield [unit, index, rate] as Tile;
            }
        }
    }
}

function cast( tiles: Tile[], size: number, powerPlants = 0, accumulators = 0 ) {
    tiles.sort( sortByRate );

    const layout: Unit[] = new Array(size);

    for ( let index = 0; index <= size; index +=1 ) {
        if ( tiles[index]![0] === empty ) {
            if ( powerPlants ) {
                tiles[index]![0] = p;
                powerPlants -= 1;
            }
            else if ( accumulators ) {
                tiles[index]![0] = a;
                accumulators -= 1;
            }
            else {
                break;
            }
        }
    }

    for ( let index = 0; index <= size; index +=1 ) {
        layout[tiles[index]![1]!] = tiles[index]![0];
    }

    return layout;
}

export function populate( layout: Layout, powerPlants = 34, accumulators = 6 ) {
    if ( powerPlants + accumulators > maxUnits ) throw new Error("Too many units");

    const size = Math.min( layout.length, layoutSize );
    const tiles = Array.from( getTiles(layout, size, true) );
    return cast( tiles, size, powerPlants, accumulators );
}

export function optimize( layout: Layout, depth = 0 ) {
    const powerPlants = layout.filter(unit => unit === p).length;
    const accumulators = layout.filter(unit => unit === a).length;
    const size = Math.min( layout.length, layoutSize );

    let best = calculate(layout.slice());
    let more = true;

    if ( accumulators > 2 ) { // We move accumulators to seek optimal placement
        while ( more ) {
            more = false;

            const snap = best.layout;

            for (let from = 0; from < size; from += 1) {
                const source = snap[from]!;

                if (source !== a) continue; // we only move accumulators

                for (let to = 0; to < size; to += 1) {
                    const target = snap[to]!;

                    // Skip: same position or swapping identical unit types (p↔p, a↔a)
                    if ( from === to || target === source ) continue;
                    // Skip: resources are fixed in place
                    if ( target === c || target === t ) continue;
                    // Skip: avoid duplicate swaps (swap 0↔3 same as 3↔0, only do it once)
                    if ( target === p && from > to ) continue;

                    snap[from] = target;
                    snap[to] = source;

                    const tiles = Array.from( getTiles(snap, size) );

                    for ( const next of layouts(cast(tiles, size, powerPlants), depth) ) {
                        const current = calculate(next);

                        if ( isGreater(current, best) ) {
                            best = current;
                            best.layout = next.slice();
                            more = true;
                        }
                    }

                    snap[from] = source;
                    snap[to] = target;
                }
            }
        }
    } else { // Not enough accumulators to move, just permuted optimal placement
        const snap = best.layout;
        const tiles = Array.from( getTiles(snap, size) );

        for ( const next of layouts(cast(tiles, size, powerPlants), depth) ) {
            const current = calculate(next);

            if ( isGreater(current, best) ) {
                best = current;
                best.layout = next.slice();
            }
        }
    }

    return best.layout;
}

export default function memoize( layout: Layout, depth = 0 ) {
    const id = hash(layout);
    return get( id, type, depth ) ?? set( id, type, depth, optimize( layout, depth ) );
}