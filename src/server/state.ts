import * as Layout from "/layout/index.ts";
import type { BunRequest } from "bun";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export default {
    POST: async (req: BunRequest<"/state">) => {
        const { world, x, y, type, state } = await req.json();

        if (!world || x === undefined || y === undefined || !type) {
            return Response.json(
                { error: "Missing required fields: world, x, y, type" },
                { status: 400, headers }
            );
        }

        Layout.setState(world, { x, y }, type, state);

        return Response.json({ success: true }, { headers });
    },

    OPTIONS: async () => {
        return new Response(null, { status: 204, headers });
    },
};
