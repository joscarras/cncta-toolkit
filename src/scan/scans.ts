import db from "/scan/db.ts";
import type { Data } from "/addon/upload.ts";

export type City = Data["cities"][number];

export interface Row {
    id: number;
    world: number;
    player: number;
    status: string;
    data: string;
    created_at: string;
}

db.run(`
    CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        world INTEGER NOT NULL,
        player INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        data TEXT NOT NULL CHECK (json_valid(data)),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_scans_status ON scans (status);`);
db.run(`CREATE INDEX IF NOT EXISTS idx_scans_world ON scans (world);`);
db.run(`CREATE INDEX IF NOT EXISTS idx_scans_player ON scans (player);`);

const read = {
    all: db.query<Row, []>(`
        SELECT * FROM scans
    `),
    failed: db.query<Pick<Row, "id">, []>(`
        SELECT id FROM scans WHERE status = 'failed'
    `),
    pending: db.query<Pick<Row, "id">, []>(`
        SELECT id FROM scans WHERE status = 'pending'
    `),
};

const write = {
    insert: db.query<void, [number, number, string, string]>(`
        INSERT INTO scans (
            world, player, status, data
        )
        VALUES (
            ?, ?, ?, json(?)
        )
    `),

    reset: db.query<void, []>(`
        UPDATE scans SET status = 'pending' WHERE status IN ('processing', 'failed')
    `),

    lock: db.query<Row, [number]>(`
        UPDATE scans SET status = 'processing' WHERE id = ? AND status = 'pending'
        RETURNING *
    `),

    complete: db.query<void, [number]>(`
        UPDATE scans SET status = 'complete' WHERE id = ? AND status = 'processing'
    `),

    fail: db.query<void, [number]>(`
        UPDATE scans SET status = 'failed' WHERE id = ? AND status = 'processing'
    `),

    unlock: db.query<void, [number]>(`
        UPDATE scans SET status = 'pending' WHERE id = ? AND status = 'processing'
    `)
};

export function add( data: Data ) {
    const world = data.server.id;
    const player = data.player.id;
    const status = "pending";
    const json = JSON.stringify(data);

    write.insert.run( world, player, status, json );

    return data.cities.map( city => city.id );
}

export function lock(id: number) {
    const row = write.lock.get(id);

    if (!row) return null;

    const data = JSON.parse(row.data) as Data;
    return Object.assign(row, { data });
}

export function unlock(id: number) {
    write.unlock.run(id);
}

export function complete(id: number) {
    write.complete.run(id);
}

export function fail(id: number) {
    write.fail.run(id);
}

export function* all() {
    for (const row of read.all.iterate()) {
        const data = JSON.parse(row.data) as Data;
        yield Object.assign( row, { data } );
    }
}

export function* failed() {
    for (const { id } of read.failed.iterate()) {
        yield id;
    }
}

export function* pending() {
    for (const { id } of read.pending.iterate()) {
        yield id;
    }
}

if (Bun.isMainThread) {
    Promise.try( () =>write.reset.run() ).catch( console.warn );
}