import { token, host } from "/defaults.ts";

type Payload = Record<string, unknown>;
type Sender = browser.runtime.MessageSender;

const browser = globalThis.browser ?? (globalThis as any).chrome;
const runtime = browser?.runtime;
const storage = "cncta_tools_storage";

function getRequest( url: URL, options: RequestInit ) {
    return new Request( url, {
        method: "POST",
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...options?.headers,
        },
    } );
}

// Only Google Apps Script web apps get a plain POST, without the token
function isSheet( url: unknown ) {
    return typeof url === "string" && url.startsWith( "https://script.google.com/" );
}

async function send( url: string, body: string ) {
    const request = await globalThis.fetch( url, { method: "POST", body, headers: { "Content-Type": "text/plain" } } );

    if ( request.ok ) return request.json();

    const { statusText, status } = request;
    const err = await request.text();
    throw new Error( `Error: ${status} ${statusText}: ${err}` );
}

// Background script listener (used by Firefox)
export async function listener( payload: Payload, sender: Sender ) {
    try {
        if ( payload.type === "fetch" && payload.url && payload.options ) {
            const url = new URL( payload.url.toString() );
            const request = await globalThis.fetch( getRequest( url, payload.options ) );

            if ( request.ok ) return request.json();

            const { statusText, status } = request
            const err = await request.text();
            throw new Error( `Error: ${status} ${statusText}: ${err}` );
        }

        if ( payload.type === "post" && isSheet( payload.url ) && payload.body ) {
            return send( payload.url as string, payload.body as string );
        }

        if ( payload.type === "storage.get" && payload.key ) {
            return browser.storage.local.get( payload.key as string );
        }

        if ( payload.type === "storage.set" && payload.data ) {
            return browser.storage.local.set( payload.data as Record<string, unknown> );
        }
    }

    catch ( err ) {
        return { err: err?.toString() ?? "Unknown error" };
    }
}

export async function load<Type>( path: string, options: RequestInit ) {
    const url = `${ host }/${ path }`;

    // Firefox: use message passing to background script
    if ( runtime?.sendMessage ) {
        const payload = await runtime.sendMessage( { type: "fetch", url, options } );
        const err = payload?.err as string | undefined;
        return err ? Promise.reject( new Error( err ) ) : payload as Type;
    }

    // Chrome MAIN world: use direct fetch (use nativeFetch to avoid recursion)
    const request = await fetch( getRequest( new URL( url ), options ) );

    if ( request.ok ) return request.json() as Type;

    const { statusText, status } = request;
    const err = await request.text();
    throw new Error( `Error: ${status} ${statusText}: ${err}` );
}

export async function post<Type>( url: string, body: string ) {
    if ( !isSheet( url ) ) throw new Error( "Not a Google Apps Script URL" );

    // Firefox: use message passing to background script
    if ( runtime?.sendMessage ) {
        const payload = await runtime.sendMessage( { type: "post", url, body } );
        const err = payload?.err as string | undefined;
        return err ? Promise.reject( new Error( err ) ) : payload as Type;
    }

    return send( url, body ) as Promise<Type>;
}

export async function get<Type>( key: string, fallback: Type ) {
    // Firefox: use message passing to background script
    if ( runtime?.sendMessage ) {
        const payload = await runtime.sendMessage( { type: "storage.get", key } );
        const err = payload?.err as string | undefined;

        if ( err ) return Promise.reject( new Error( err ) );

        return payload?.[key] as Type ?? fallback;
    }

    // Chrome MAIN world: use localStorage
    try {
        const data = localStorage.getItem( storage );
        const parsed = data ? JSON.parse( data ) : {};
        return parsed[key] ?? fallback;
    } catch {
        return fallback;
    }
}

export async function set( data: Record<string, unknown> ) {
    // Firefox: use message passing to background script
    if ( runtime?.sendMessage ) {
        const payload = await runtime.sendMessage( { type: "storage.set", data } );
        const err = payload?.err as string | undefined;

        if ( err ) return Promise.reject( new Error( err ) );

        return undefined;
    }

    // Chrome MAIN world: use localStorage
    try {
        const existing = localStorage.getItem( storage );
        const parsed = existing ? JSON.parse( existing ) : {};

        localStorage.setItem( storage, JSON.stringify( { ...parsed, ...data } ) );
    } catch ( err ) {
        console.error( "Storage set error:", err );
    }
}
