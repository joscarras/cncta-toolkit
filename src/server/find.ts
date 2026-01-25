import { from } from "/cnctaopt/index.ts";
import * as Layout from "/layout/index.ts";
import type { Type } from "/layout/index.ts";
import type { BunRequest } from "bun";

type Data = ReturnType<typeof Layout.find> extends Iterable<infer Type> ? Type : never;

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

function toInt( value: string | null ) {
    return value ? parseInt(value) : undefined;
}

function toFloat( value: string | null ) {
    return value ? parseFloat(value) : undefined;
}

function toCoords( value: string | null ) {
    const [x, y] = value ? value?.split( ":" ) : [];
    return x && y ? { x: parseInt( x ), y: parseInt( y ) } : undefined;
}
    
function cast( { data, type, ...rest }: Data ) {
    return {
        ...rest,
        type,
        data,
        efficiency: Layout.score( data.totalPower, type),
        link: from( data.layout, { x: rest.x, y: rest.y } ),
    };
}

export default {
    GET: async (req: BunRequest<"/find">) => {
        const url = new URL(req.url);

        const world = toInt( url.searchParams.get("world") );
        const type = url.searchParams.get("type") as Type ?? undefined;
        const coords = toCoords( url.searchParams.get("coords") );
        const efficiency = toFloat( url.searchParams.get("efficiency") );
        const limit = parseInt( url.searchParams.get("limit") ?? "20" );
        const filters = { limit, type, world, efficiency, coords };
        const data = Array.from( Layout.find(filters), cast );
        return Response.json( data, { headers });
    },

    POST: async (req: BunRequest<"/find">) => {
        const { type = "power", limit = 20, ...rest } = await req.json();
        const filters = { ...rest, limit, type };
        const data = Array.from( Layout.find(filters), cast );
        return Response.json( data, { headers });
    },

    OPTIONS: async () => {
        return new Response(null, { status: 204, headers });
    },
};
