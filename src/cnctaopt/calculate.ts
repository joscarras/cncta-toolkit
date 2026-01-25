import production from "/production";
import type { Grid } from "/cnctaopt/index.ts";
import { layout } from "/addon/units.ts";
import { layoutSize } from "/defaults.ts";
import { offsets } from "/layout/index.ts";
import * as print from "/cnctaopt/print.ts";

export type Readings = ReturnType<typeof calculate>;

const { a, n, p, c } = layout;

export default function calculate( grid: Grid ) {
    const size = Math.min( grid.length, layoutSize );

    let continuousPower = 0;
    let resourcePower = 0;
    let units = 0;
    let powerPlants = 0;
    let accumulators = 0;

    for ( let index = 0; index <= size; index += 1 ) {
        const [unit, level] = grid[index]!;
        const value = production[level as keyof typeof production] ?? 0;
        
        if ( unit === p ) {
            let boosted = false;

            resourcePower += 1 * value;
            powerPlants += 1;
            units += 1;

            for ( const offset of offsets[index]! ) {
                const [type] = grid[offset]!;

                if ( type === c || type === n ) {
                    continuousPower += 5 * value;
                }

                else if ( !boosted && type === a ) {
                    boosted = true;
                }
            }

            if ( boosted ) {
                continuousPower += 6 * value;
            }
        } else if ( unit === a ) {
            accumulators += 1;
            units += 1;

            for ( const offset of offsets[index]! ) {
                if ( grid[offset]![0] === p ) {
                    continuousPower += 4 * value;
                }
            }
        }
    }

    continuousPower /= 10;

    return {
        units,
        powerPlants,
        accumulators,
        resourcePower,
        continuousPower,
        totalPower: resourcePower + continuousPower,
        totalTiberium: 0,
        totalCrystal: 0,
        totalCredit: 0,
    };
}
