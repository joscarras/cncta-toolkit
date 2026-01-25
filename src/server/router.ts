import find from "/server/find.ts";
import optimize from "/server/optimize.ts";
import process from "/server/process.ts";
import readings from "/server/readings.ts";
import seek from "/server/seek.ts";
import state from "/server/state.ts";
import sync from "./sync";

import upload from "/server/upload.ts";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { readFileSync } from "node:fs";
import { serve } from "bun";

const path = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(path, "index.html"), "utf-8");

export const server = serve({
    development: true,
    routes: {
        "/": new Response(html, {
            headers: { "Content-Type": "text/html" },
        }),
        "/find": find,
        "/optimize": optimize,
        "/process": process,
        "/readings": readings,
        "/state": state,
        "/sync": sync,
        "/seek": seek,
        "/upload": upload,
    },

    async fetch() {
        return Response.json({ error: "Route not found" }, { status: 404 });
    },
});

console.log(`Server ready on http://${server.hostname ?? "localhost"}:${server.port}`);
