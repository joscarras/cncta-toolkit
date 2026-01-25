import offsets from "/layout/offsets.ts";
import type { Layout } from "/layout/index.ts";
import { layout } from "/addon/units.ts";
import { layoutSize } from "/defaults.ts";

export type Readings = ReturnType<typeof calculate>;

const { a, c, n, p } = layout;

export default function calculate( layout: Layout ) {
    const size = Math.min( layout.length, layoutSize );

    let continuousPower = 0;
    let resourcePower = 0;
    let units = 0;
    let powerPlants = 0;
    let accumulators = 0;

    for ( let index = 0; index <= size; index += 1 ) {
        const unit = layout[index]!;
        
        if ( unit === p ) {
            let boosted = false;

            resourcePower += 1;
            powerPlants += 1;
            units += 1;

            for ( const offset of offsets[index]! ) {
                const next = layout[offset];

                if ( next === c || next === n ) {
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
            accumulators += 1;
            units += 1;
            
            for ( const offset of offsets[index]! ) {
                if ( layout[offset] === p ) {
                    continuousPower += 4;
                }
            }
        }
    }

    continuousPower /= 10;

    return {
        accumulators,
        continuousPower,
        layout,
        powerPlants,
        resourcePower,
        totalCredit: 0,
        totalCrystal: 0,
        totalPower: resourcePower + continuousPower,
        totalTiberium: 0,
        units,
    };
}
