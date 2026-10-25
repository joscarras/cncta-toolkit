import { init } from "/addon/api.ts";
import gui from "/addon/gui.ts";
import { sync, scan, autoScan, sheet } from "/addon/action.ts";

const addon = "CNCAddon";

(async function () {
    "use strict";

    if ( !/commandandconquer\.com/i.test(window.location.hostname)) return;

    try {
        const api = await init();
        const elements = gui();

        autoScan( api, elements.autoScan, { quick: true } );
        scan( api, elements.quickScan, { quick: true } );
        scan( api, elements.scan );
        sync( api, elements.sync );
        sheet( api, elements.sheet );

        console.log( `${addon}: Ready! Click the scan button to start.` );
    } catch (error) {
        console.error( addon, error );
    }
})();
