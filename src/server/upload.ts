import * as Scan from "/scan/index.ts";
import type { BunRequest } from "bun";
import { token } from "/defaults.ts";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function run() {
    try {
        for await ( const data of Scan.run() ) {
            if ( "err" in data ) {
                console.error( data.err);
            } else {
                console.log( "Processed scan:", data );
            }
        }
    }

    catch (err) {
        console.error( err );
    }
}

export default {
    OPTIONS: async () => {
        return new Response(null, { status: 204, headers });
    },

    POST: async (req: BunRequest<"/upload">) => {
        const auth = req.headers.get("authorization");

        if (!token || auth !== `Bearer ${token}`) {
            return Response.json(
                { err: "Unauthorized" },
                { status: 401, headers }
            );
        }

        try {
            const ids = await Scan.add(await req.json());

            return Response.json(
                ids,
                { headers }
            );
        } catch (err) {
            return Response.json(
                { err: `${err}` },
                { status: 400, headers }
            );
        } finally {
            run();
        }
    },
};
