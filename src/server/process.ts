import * as Scan from "/scan/index.ts";

async function run( type?: "pending" | "failed" ) {
    try {
        for await ( const data of Scan.run( type ) ) {
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

export default async function process(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") as "pending" | "failed" | null;

    run( type ?? undefined );

    return Response.json( { ok: true, type } );
}
