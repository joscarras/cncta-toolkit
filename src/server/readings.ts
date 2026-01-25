import * as Layout from "/layout/index.ts";
import * as Power from "/power/index.ts";
import type { BunRequest } from "bun";
import { parse, calculate } from "/cnctaopt/index";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export default {
    POST: async (req: BunRequest<"/readings">) => {
        const { url } = await req.json();

        try {
            const { grid } = parse(url);
            const data = calculate( grid );
            const { totalPower } = Layout.calculate(Layout.cast(grid));
            const efficiency = Layout.score(totalPower, Power.type);

            return Response.json(
                { ...data, efficiency, link: url },
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