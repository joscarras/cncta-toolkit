import { workers } from "/defaults";
import queue from "/scan/queue.ts";
import process from "./process";
import type { Data } from "/scan/process.ts";

let active = 0;

function isString( type: unknown ): type is string {
    return type ? typeof type === "string" : false;
}

function toError( { error, filename, lineno, colno, message }: ErrorEvent): Error {
    if ( error instanceof Error ) return error;

    const location = [filename, lineno, colno ].filter( isString ).join( ":" );

    return new Error( message + (location ? `\n  at ${location}` : "") );
}

export default async function* run( type: "pending" | "failed" = "pending" ) {
    if ( active >= workers ) return;

    console.log("Worker start", type, active );

    const { iterator, push, resolve, reject } = queue<Data>();
    const worker = new Worker( import.meta.url, { env: { SCAN_TYPE: type } } );
    
    try {
        active += 1;

        worker.onmessage = ( { data } ) => data.done ? resolve() : push(data);
        worker.onerror = (err) => reject( toError(err) );

        yield* iterator;
    }

    finally {
        active -= 1;
        worker.terminate();
        console.log("Worker done", type, active );
    }
}

// Worker entry point
if (!Bun.isMainThread) {
    const type = Bun.env.SCAN_TYPE as "pending" | "failed";

    for (const data of process( type ) ) {
        postMessage(data);
    }
}
