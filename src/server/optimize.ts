import * as Layout from "/layout/index.ts";
import * as Power from "/power/index.ts";
import type { BunRequest } from "bun";
import { parse, update, cast } from "/cnctaopt/index.ts";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export default {
    POST: async (req: BunRequest<"/optimize">) => {
        const { url } = await req.json();

        try {
            const data = parse(url);
            const { layout, ...rest } = Power.optimize(Power.normalize(data.grid));
            const efficiency = Layout.score(rest.totalPower, Power.type);
            const link = update(url, cast(layout));

            return Response.json(
                { ...rest, efficiency, link },
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
