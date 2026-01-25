import { listener } from "./tools";

declare const chrome: any;

if ( globalThis?.browser ) {
    browser.runtime.onMessage.addListener( listener );
} else if ( ( globalThis as any )?.chrome ) {
    chrome.runtime.onMessage.addListener( listener );
} else {
    throw new Error( "No browser runtime found" );
}
