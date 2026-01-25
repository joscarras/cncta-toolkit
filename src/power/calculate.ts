import type { Layout } from "/power/index.ts";
import { layout } from "/addon/units.ts";
import { layoutSize } from "/defaults.ts";
import { offsets, type Readings } from "/layout/index.ts";

const { a, c, p } = layout;

type Metrics = "totalPower" | "continuousPower";

export function isGreater( lhs: Pick<Readings, Metrics>, rhs: Pick<Readings, Metrics> ) {
    if ( lhs.totalPower > rhs.totalPower ) return true;
    if ( lhs.totalPower < rhs.totalPower ) return false;
    if ( lhs.continuousPower > rhs.continuousPower ) return true;
    return false
}

export default function calculate( layout: Layout ) {
    const size = Math.min( layout.length, layoutSize );
    
    let continuousPower = 0;
    let resourcePower = 0;

    for ( let index = 0; index <= size; index += 1 ) {
        const unit = layout[index]!;
        
        if ( unit === p ) {
            let boosted = false;

            resourcePower += 1;

            for ( const offset of offsets[index]! ) {
                const next = layout[offset];

                if ( next === c ) {
                    continuousPower += 5;
                }

                else if ( !boosted && next === a ) {
                    boosted = true;
                }
            }

            if ( boosted ) {
                continuousPower += 6;
            }
        } else if ( unit === a ) {
            for ( const offset of offsets[index]! ) {
                if ( layout[offset] === p ) {
                    continuousPower += 4;
                }
            }
        }
    }
    
    continuousPower /= 10;
    
    return {
        continuousPower,
        layout,
        resourcePower,
        totalPower: resourcePower + continuousPower,
    };
}
