import optimize from "/power/optimize.ts";
import { layout } from "/addon/units.ts";
import { update, isGreater, type Layout } from "/power/index.ts";

export type Readings = ReturnType<typeof optimize>;

const { a, p } = layout;

export default function seek( layout: Layout, depth = 0 ) {
    const readings: Readings[] = [];

    let count = 0;

    while ( true ) {
        const { length } = readings;

        if ( length > 3 ) {
            const [current, previous] = readings as [Readings, Readings];
            
            if ( isGreater( previous, current ) ) {
                return previous; // Return the previous reading if it is greater
            }

            else if ( count > 0 ) {
                count += 1; // Continue in the "more" direction
            }

            else {
                count -= 1; // Continue in the "less" direction
            }
        }

        else if ( length === 3 ) {
            const [less, more, base] = readings as [Readings, Readings, Readings];

            if ( isGreater( base, more ) && isGreater( base, less ) ) {
                return base; // The base has the highest power
            }

            else if ( isGreater( more, less ) ) {
                readings.unshift( more ) // To keep the correct order
                count = 2; // Continue in the "more" direction
            }

            else {
                count = -2; // Continue in the "less" direction
            }
        }

        else if ( length === 2 ) {
            count = -1; // Start in the "less" direction
        }

        else if ( length === 1 ) {
            count = 1; // Start in the "more" direction
        }

        // Find the current optimal layout
        const current = optimize( update(layout, a, p, count), depth );

        // Insert the new reading at the head of the list
        readings.unshift( current );
    }
}