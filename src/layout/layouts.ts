import db from "/layout/db.ts";
import type { Coords } from "/addon/api.ts";
import type { Readings } from "/layout/calculate";
import type { Type } from "/layout/readings.ts";
import { max } from "/layout/readings.ts";

export type State = "taken" | "locked" | "seen" | null;

export interface Row {
    world: number;
    x: number;
    y: number;
    hash: string;
    type: Type;
    state: State;
    created_at: string;
    updated_at: string;
}

export interface Data extends Row {
    depth: number;
    data: string;
}

export interface Filters {
    world?: number | undefined;
    type?: Type | undefined;
    coords?: Coords | undefined;
    limit?: number | undefined;
    efficiency?: number | undefined;
}

db.run(`
    CREATE TABLE IF NOT EXISTS layouts (
        world INTEGER NOT NULL,
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        hash TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (world, x, y, type)
    )
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_layouts_world_type ON layouts (world, type);`);

// Add state column to existing table (safe migration - won't affect existing data)
try {
    db.run(`ALTER TABLE layouts ADD COLUMN state TEXT DEFAULT NULL`);
} catch {
    // Column already exists, ignore error
}

const read = {
    select: db.query<Pick<Row, "hash">, [number, number, number, Type]>(`
        SELECT hash FROM layouts WHERE world = ? AND x = ? AND y = ? AND type = ?
    `),

    all: db.query<Row, []>(`
        SELECT * FROM layouts
    `),

    find: db.query<Data, [number | null, number | null, Type, number | null, number | null, number, number, number, number, number]>(`
        SELECT
            l.world, l.x, l.y, l.hash, l.type, l.state,
            r.depth, r.data
        FROM layouts l
        JOIN readings r ON l.hash = r.hash AND l.type = r.type
        WHERE
            (? IS NULL OR l.world = ?)
            AND (l.type = ?)
            AND (? IS NULL OR (
                CASE l.type
                    WHEN 'power' THEN r.power
                    WHEN 'tiberium' THEN r.tiberium
                    WHEN 'crystal' THEN r.crystal
                    WHEN 'credit' THEN r.credit
                END >= ?
            ))
        ORDER BY
            ((l.x - ?) * (l.x - ?) + (l.y - ?) * (l.y - ?)) ASC
        LIMIT ?
    `),

    findWithCoords: db.query<Data, [number | null, number | null, Type, number | null, number | null, number]>(`
        SELECT
            l.world, l.x, l.y, l.hash, l.type, l.state,
            r.depth, r.data
        FROM layouts l
        JOIN readings r ON l.hash = r.hash AND l.type = r.type
        WHERE
            (? IS NULL OR l.world = ?)
            AND (l.type = ?)
            AND (? IS NULL OR (
                CASE l.type
                    WHEN 'power' THEN r.power
                    WHEN 'tiberium' THEN r.tiberium
                    WHEN 'crystal' THEN r.crystal
                    WHEN 'credit' THEN r.credit
                END >= ?
            ))
        ORDER BY
            CASE l.type
                WHEN 'power' THEN r.power
                WHEN 'tiberium' THEN r.tiberium
                WHEN 'crystal' THEN r.crystal
                WHEN 'credit' THEN r.credit
            END DESC
        LIMIT ?
    `)
};

const write = {
    upsert: db.query<void, [number, number, number, string, Type]>(`
        INSERT INTO layouts (
            world, x, y, hash, type, updated_at
        )

        VALUES (
            ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
        )

        ON CONFLICT(
            world, x, y, type
        )

        DO UPDATE SET
            hash = excluded.hash,
            updated_at = CURRENT_TIMESTAMP
    `),

    state: db.query<void, [State, number, number, number, Type]>(`
        UPDATE layouts
        SET state = ?, updated_at = CURRENT_TIMESTAMP
        WHERE world = ? AND x = ? AND y = ? AND type = ?
    `)
};

function cast( { data, ...rest }: Data ) {
    return { ...rest, data: JSON.parse(data) as Readings };
}

function getMin( efficiency: number, key: Type ) {
    const maxValue = max(key) ?? 0;
    return maxValue <= 80 ? 0 : 80 + (efficiency / 100) * (maxValue - 80);
}

export function get( world: number, coords: Coords, type: Type ) {
    const row = read.select.get(world, coords.x, coords.y, type);
    return row?.hash;
}

export function add( world: number, coords: Coords, hash: string, type: Type ) {
    write.upsert.run(world, coords.x, coords.y, hash, type);
}

export function setState( world: number, coords: Coords, type: Type, state: State ) {
    write.state.run(state, world, coords.x, coords.y, type);
}

export function* all() {
    yield* read.all.iterate();
}

export function* find(filters: Filters = {}) {
    const { world = null, type = "power", coords, limit = 20, efficiency } = filters;
    const  min = efficiency ? getMin( efficiency, type ) : 0;

    if (coords) {
        const { x, y } = coords;
        const params = [world, world, type, min, min, x, x, y, y, limit] as const;

        for (const row of read.find.iterate(...params)) {
            yield cast(row);
        }
    } else {
        const params = [world, world, type, min, min, limit] as const;

        for (const row of read.findWithCoords.iterate(...params)) {
            yield cast(row);
        }
    }
}
