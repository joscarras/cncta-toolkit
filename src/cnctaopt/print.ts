import type {  Grid, Tile } from "/cnctaopt/index.ts";
import type { Layout } from "/layout/index.ts";
import { gridCols, layoutSize, gridSize } from "/defaults.ts";
import { terrain } from "/addon/units";

const ignore = new Set<string>( Object.values( terrain ) );

function pad( value: number|string, length: number ) {
    return value.toString().padStart( length, " " );
}

function simple( [unit, level]: Tile ) {
    return ignore.has( unit ) ? `  ${ unit }` : `${ pad(level, 2) }${ unit }`;
}

function indexed( this: number, [unit, level]: Tile, col: number ) {
    const index = this + col;
    return `${pad(index, 3)}[${simple( [unit, level] )}]`;
}

function join( tiles: string[], separator?: string ) {
    return separator === undefined ? tiles : tiles.join( separator );
}

export function layout(layout: Layout, separator = " ", eol ?: string ) {
    const size = Math.min( layout.length, layoutSize );
    const rows = [];

    for (let index = 0; index < size; index += gridCols) {
        rows.push(layout.slice(index, index + gridCols).join( separator ));
    }

    return eol ? rows.join( eol ) : rows;
}

export function grid( grid: Grid, separator?: string, indexes = false, eol ?: string ) {
    const size = Math.min( grid.length, gridSize );
    const rows = [];
    const format = indexes ? indexed : simple;

    for (let index = 0; index < size; index += gridCols) {
        rows.push(
            join( grid.slice(index, index + gridCols).map( format, index ), separator )
        );
    }

    return eol ? rows.join( eol ) : rows;
}