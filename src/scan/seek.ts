import * as Layout from "/layout/index.ts";
import * as Power from "/power/index.ts";
import type { City } from "./scans";

export default function* seek( world: number, city: City ) {
    const { id, grid, coords } = city;

    {
        const { type } = Power
        const { layout, hash, ...rest } = Power.seek( Power.normalize( grid ) );
        const efficiency = Math.round( Layout.score( rest.totalPower, type ) ?? 0 );

        Layout.add( world, coords, hash, type );
        
        yield { world, id, type, efficiency } as const;
    }
}