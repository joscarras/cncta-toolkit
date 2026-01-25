import { layoutSize, cnctaoptUrl, gridLength, defaultLevel } from "/defaults.ts";
import type { Layout } from "/layout/index.ts";
import { units, empty, terrain } from "/addon/units.ts";
import type { Coords } from "/addon/api";

export { default as calculate, type Readings } from "/cnctaopt/calculate.ts";
export { layout as print } from "/cnctaopt/print.ts";

export type Data = ReturnType<typeof parse>;
export type Grid = Tile[];
export type Tile = [unit: Unit, level: number];
export type Unit = typeof units[keyof typeof units];

const template = "ver=3~N~N~base~.~E=new~X=00~Y=00~WID=.~WN=.~ML=65";
const ignore = new Set<string>( Object.values( terrain ) );

function fromTile( [unit, level]: Tile ) {
    return ignore.has(unit) ? unit : `${ level }${ unit }`;
}

function* parseParams( parts: string[] ) {
    for ( const part of parts ) {
        const [key, value] = part.split("=");
        
        if ( value ) yield [key, value];
    }
}

function* parseGrid( encoded: string, grid: Grid = [], level?: number ) {
    const tilePattern = /(\d*)(\D)/g;
    const size = Array.from( encoded.matchAll( tilePattern ) ).length;
 
    let match;
    let index = 0;

    while ( match = index <= size ? tilePattern.exec( encoded ) : null ) {
        const tile = grid.at( index ) ?? [match[2], match[1]];
        const type = tile[0] as Unit || empty;

        if ( type === empty ) yield [empty, 0] as Tile;
        else if ( level ) yield [type, level] as Tile;
        else yield [type, parseInt( tile[1]?.toString() || "0", 10 )] as Tile;

        index += 1;
    }
}

export function parse( url: string ) {
    const hash = decodeURI(new URL(url).search?.slice(1));
    const parts = hash?.split("~");
    const { newEconomy, ...rest } = Object.fromEntries( parseParams( parts ) );
    const faction = parts[1] ?? null;
    const name = parts[3] ?? null;
    const wid = rest.WID ? parseInt(rest.WID, 10) : null;
    const world = rest.WN ? decodeURIComponent(rest.WN) : null;
    const coords = { x: parseInt( rest.X, 10 ), y: parseInt( rest.Y, 10 ) };
    const grid = Array.from( parseGrid( parts[4]! ) );
    // @todo Check the server tech properly
    const server = { id: wid, name: world, tech: newEconomy };

    // if ( grid.length !== gridLength ) throw new Error("Invalid grid length");
    // if ( !coords.x ) throw new Error("x is required");
    // if ( !coords.y ) throw new Error("y is required");
    if ( !faction ) throw new Error("faction is required");
    if ( !name ) throw new Error("name is required");
    // if ( !wid ) throw new Error("wid is required");
    if ( !world ) throw new Error("world is required");

    return { url, coords, faction, grid, name, server };
}

export function cast( layout: Layout, level = defaultLevel ) {
    const size = Math.min( layout.length, layoutSize );
    const grid: Grid = new Array( gridLength ).fill( [empty, 0] );
    
    for ( let index = 0; index <= size; index += 1 ) {
        if ( layout[index] !== empty ) {
            grid[index] = [layout[index]!, level];
        }
    }

    return grid;
}

export function from( layout: Layout, coords: Coords, level = defaultLevel ) {
    const data = parse( `${ cnctaoptUrl }?${ template }` );
    const grid = cast( layout, level );
    return create( { ...data, grid, coords } )
}

export function create( data: Omit<Data, "url" | "layout"> ) {
    const { coords, faction, grid, name, server } = data;
    const parts = decodeURI( template ).split("~");
 
    if ( grid.length !== gridLength ) throw new Error("Invalid grid length");
    if ( !faction ) throw new Error("faction is required");
    if ( !name ) throw new Error("name is required");
    // if ( !server.id ) throw new Error("Server id is required");
    if ( !server.name ) throw new Error("Server name is required");
    if ( !coords.x && coords.x !== 0 ) throw new Error("Coords x is required");
    if ( !coords.y && coords.y !== 0 ) throw new Error("Coords y is required");
    
    parts[1] = parts[2] = faction;
    parts[3] = name;
    parts[4] = grid.map( fromTile ).join("");
    parts[5] = server.tech ? "E=new" : "E=old";
    parts[6] = `X=${ coords.x }`;
    parts[7] = `Y=${ coords.y }`;
    parts[8] = `WID=${ server.id }`;
    parts[9] = `WN=${ encodeURIComponent( server.name || "" ) }`;

    return `${ cnctaoptUrl }?${ encodeURI( parts.join("~") ) }`;
}

export function update( url: string, grid: Grid, level?: number ) {
    const parts = decodeURI(new URL(url).search?.slice(1))?.split("~");
        
    if ( parts[1] === "F" ) {
        parts[1] = parts[2] === "N" ? "N" : "G";
    }

    if ( grid.length || level ) {
        parts[4] = Array.from( parseGrid( parts[4]!, grid, level ), fromTile ).join("");
    }

    return `${ cnctaoptUrl }?${ encodeURI( parts.join("~") ) }`;
}
