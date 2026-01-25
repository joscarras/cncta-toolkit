import { Database } from "bun:sqlite";
import { dirname } from "node:path";
import { mkdirSync } from "node:fs";

const filename = "./storage/scans.sqlite";

try {
    mkdirSync(dirname(filename), { recursive: true });
}
catch {
    console.warn("Could not create directory for scans database");
}

const db = new Database(filename, { create: true, strict: true });

db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA synchronous = NORMAL;");

export default db;