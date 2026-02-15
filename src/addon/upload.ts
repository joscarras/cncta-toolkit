import * as Tools from "/addon/tools";
import type { Api } from "/addon/api.ts";
import type { Unit } from "/addon/units";
import { world, type City } from "/addon/scan.ts";
import { cities } from "/addon/player.js";

export type Data = ReturnType<typeof getBody>;
export type Tile = [unit: Unit, level: number];

export interface Options {
    quick?: boolean;
    radius?: number;
    size?: number;
}

const storage = "cncta_tools_upload_cache";
const cache = { hashes: new Set<string>(), coords: new Set<string>() };

function cast( city: City ) {
    return {
        alliance: city.alliance,
        coords: city.coords,
        faction: city.faction,
        grid: city.grid.map( ( [type, level] ) => [type, level] as Tile ),
        id: city.id,
        levels: city.levels,
        name: city.name,
        owner: city.owner,
        packages: city.packages,
        production: city.production,
        resources: city.resources,
        storage: city.storage,
        type: city.type,
    }
}

function getBody( { info }: Api, cities: City[] ) {
    return {
        alliance: info.alliance,
        bonus: info.bonus,
        cities: cities.map(cast),
        player: info.player,
        server: info.server,
    };
}

function getTotal( api: Api, radius?: number ) {
    return Array.from( world( api, radius ) ).length;
}

function addCites( cities: City[], ids: Set<number> ) {
    for (const { id, hash, type } of cities) {
        if ( ids.has( id ) && !cache.hashes.has( hash ) ) {
            if ( type === "base" || type === "camp" ) {
                cache.hashes.add( hash );
                cache.coords.add( hash.substring( hash.indexOf( "-" ) + 1) );
            } else {
                cache.hashes.add( hash );
            }
        }
    }
}

function getCoords( api: Api, radius = api.info.server.attack * 4 ) {
    const valid = new Set<string>();
    const max = Math.floor(radius + 1);

    for ( const city of cities( api ) ) {
        const { coords } = city;
        
        // Scan in a square around the base
        for (let y = coords.y - max; y <= coords.y + max; y++) {
            for (let x = coords.x - max; x <= coords.x + max; x++) {
                // Calculate actual distance
                const diffX = Math.abs(coords.x - x);
                const diffY = Math.abs(coords.y - y);
                const distance = Math.sqrt((diffX * diffX) + (diffY * diffY));
                
                // Skip if outside the distance range
                if (distance <= radius) {
                    valid.add(`${x}:${y}`);
                }
            }
        }
    }

    return valid;
}

async function getHashes( api: Api, server: number ) {
    await addHashes( api, await Tools.get<string[]>( `${ storage }_${ server }`, [] ) );
}

async function setHashes( server: number, hashes: Set<string> ) {
    // Get existing hashes from storage and merge with new ones
    const stored = await Tools.get<string[]>( `${ storage }_${ server }`, [] );
    const all = new Set([...stored, ...hashes]);
    return Tools.set({ [`${ storage }_${ server }`]: [...all] });
}

function addHashes( api: Api, hashes: string[] ) {
    const validCoords = getCoords( api );
    
    for (const hash of hashes) {
        if ( !cache.hashes.has( hash ) ) {
            // Extract coords from hash (format: "id-x:y" or "cid-x:y")
            const coords = hash.substring( hash.indexOf( "-" ) + 1 );
            
            // Only add hash if its coordinates are within valid range
            if ( validCoords.has( coords ) ) {
                cache.hashes.add( hash );
                cache.coords.add( coords );
            }
        }
    }
}

function hasHash( hash: string, quick: boolean ) {
    if ( cache.hashes.has( hash ) ) return true;
    if ( !quick || hash.at(0) === "c" ) return false;
    return cache.coords.has( hash.substring( hash.indexOf( "-" ) + 1) );
}

export async function sync( api: Api ) {
    await getHashes( api, api.info.server.id );
    const body = JSON.stringify( [...cache.hashes] );
    const hashes = await Tools.load<string[]>( "sync", { body } );

    addHashes( api, hashes );

    await setHashes( api.info.server.id, cache.hashes );
    return hashes.length;
}

export async function* scan( api: Api, options: Options = {} ) {
    await getHashes( api, api.info.server.id );
    const { radius = 10, size = 50, quick = false } = options;
    const cities: City[] = [];
    const total  = getTotal( api, radius );
    const server = api.info.server.id;
    
    let count = 0;

    try {
        for ( const city of world( api, radius ) ) {
            count += 1;

            if ( !hasHash( city.hash, quick ) ) {
                cities.push( await city.load() );

                if ( cities.length >= size ) {
                    const body = JSON.stringify( getBody( api, cities ) );
                    const batch = await Tools.load<number[]>( "upload", { body } );
                    await getHashes( api, server );
                    
                    yield { batch, total, count };

                    addCites( cities, new Set( batch ) );
                    setHashes( server, cache.hashes ).catch( console.warn );
                    cities.length = 0;
                } else {
                    yield { total, count };
                }
            }
        }

        if ( cities.length ) {
            const body = JSON.stringify( getBody( api, cities ) );
            const batch = await Tools.load<number[]>( "upload", { body } );

            yield { batch, total, count };

            addCites( cities, new Set( batch ) );
            cities.length = 0;
        }
    }
    
    finally {
        await getHashes( api, server ).catch( console.warn );
        await setHashes( server, cache.hashes ).catch( console.warn );
    }
}
