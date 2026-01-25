import db from "/layout/db.ts";
import { calculate, type Layout, type Readings } from "/layout/index.ts";

export type Key = "power" | "tiberium" | "crystal" | "credit";
export type Type = "power";

type Value = { value: number };
type Values = [string, Type, number, number, number, number, number, string];

export interface Row {
    hash: string;
    type: Type;
    depth: number;
    power: number;
    tiberium: number;
    crystal: number;
    credit: number;
    data: string;
    created_at: string;
    updated_at: string;
}

db.run(`
    CREATE TABLE IF NOT EXISTS readings (
        hash TEXT NOT NULL,
        type TEXT NOT NULL,
        depth INTEGER NOT NULL,
        power NUMBER NOT NULL DEFAULT 0,
        tiberium NUMBER NOT NULL DEFAULT 0,
        crystal NUMBER NOT NULL DEFAULT 0,
        credit NUMBER NOT NULL DEFAULT 0,
        data TEXT NOT NULL CHECK (json_valid(data)),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (hash, type, depth)
    )
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_readings_type ON readings (type);`);
db.run(`CREATE INDEX IF NOT EXISTS idx_readings_power ON readings (power);`);
db.run(`CREATE INDEX IF NOT EXISTS idx_readings_tiberium ON readings (tiberium);`);
db.run(`CREATE INDEX IF NOT EXISTS idx_readings_crystal ON readings (crystal);`);
db.run(`CREATE INDEX IF NOT EXISTS idx_readings_credit ON readings (credit);`);

const read = {
    select: db.query<Pick<Row, "data">, [string, Type, number]>(`
        SELECT data FROM readings WHERE hash = ? AND type = ? AND depth = ?
    `),

    all: db.query<Row, []>(`
        SELECT * FROM readings
    `)
};

const write = {
    upsert: db.query<void, Values>(`
        INSERT INTO readings (
            hash, type, depth, power, tiberium, crystal, credit, data, updated_at
        )

        VALUES (
            ?, ?, ?, ?, ?, ?, ?, json(?), CURRENT_TIMESTAMP
        )

        ON CONFLICT(
            hash, type, depth
        )

        DO UPDATE SET
            power = excluded.power,
            tiberium = excluded.tiberium,
            crystal = excluded.crystal,
            credit = excluded.credit,
            data = excluded.data,
            updated_at = CURRENT_TIMESTAMP
    `)
};

const stats = {
    power: db.query<Value, []>(`
        SELECT MAX(power) AS value FROM readings
    `),
    tiberium: db.query<Value, []>(`
        SELECT MAX(tiberium) AS value FROM readings
    `),
    crystal: db.query<Value, []>(`
        SELECT MAX(crystal) AS value FROM readings
    `),
    credit: db.query<Value, []>(`
        SELECT MAX(credit) AS value FROM readings
    `),
    count: db.query<{ c: number }, []>(`
        SELECT COUNT(*) AS c FROM readings
    `)
};

export function get( hash: string, type: Type, depth: number ) {
    const row = read.select.get(hash, type, depth);
    const data = row?.data ? JSON.parse(row.data) as Readings : undefined;
    return data ? { hash, ...data } : undefined;
}

export function set( hash: string, type: Type, depth: number, layout: Layout ) {
    const data = calculate( layout );
    const { totalPower, totalTiberium, totalCrystal, totalCredit } = data;
    const json = JSON.stringify(data);

    write.upsert.run(
        hash, type, depth, totalPower, totalTiberium, totalCrystal, totalCredit, json
    );

    return { hash, ...data };
}

export function max( key: Key ) {
    switch ( key ) {
        case "power": return stats.power.get()?.value ?? null; break;
        case "tiberium": return stats.tiberium.get()?.value ?? null; break;
        case "crystal": return stats.crystal.get()?.value ?? null; break;
        case "credit": return stats.credit.get()?.value ?? null; break;
        default: throw new Error(`Invalid key ${ key }`);
    }
}

export function score( value: number, key: Key ) {
    const maxValue = max( key ) ?? 0;
    return maxValue > 80 ? Math.max((value - 80) / (maxValue - 80) * 100, 0) : null;
}

export function count() {
    return stats.count.get()?.c ?? 0;
}

export function* all() {
    yield* read.all.iterate();
}
