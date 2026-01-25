import type { BunRequest } from "bun";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { token } from "/defaults.ts";

const filename = "./storage/cache.json";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function load( cache = new Set<string>() ) {
    if ( existsSync( filename ) ) {
        const content = readFileSync( filename, "utf-8" );
        const ids = JSON.parse( content ) as string[];
        
        ids.forEach( (item) => cache.add( item ) );
    }

    return Array.from( cache );
}

export default {
    POST: async (req: BunRequest<"/sync">) => {
        const auth = req.headers.get("authorization");

        if (!token || auth !== `Bearer ${token}`) {
            return Response.json(
                { err: "Unauthorized" },
                { status: 401, headers }
            );
        }

        try {
            const ids = load( new Set( await req.json() as string[] ) );
            
            writeFileSync( filename, JSON.stringify( ids ) );

            console.log( { sync: true, ids } );

            return Response.json(
                ids,
                { headers }
            );
        } catch (err) {
            return Response.json(
                { error: `${err}` },
                { status: 400, headers }
            );
        }
    },

    OPTIONS: async () => {
        return new Response(null, { status: 204, headers });
    },
};
