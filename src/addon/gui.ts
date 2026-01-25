import * as assets from "/addon/assets.ts"

function fail( message: string ): never {
    throw new Error( message );
}

export function addClick( node: HTMLElement | string, handler: () => unknown ) {
    if ( typeof node === "string" ) {
        document.getElementById( node )!.addEventListener("click", handler );
    }
    else {
        node.addEventListener("click", handler );
    }
}

export function getElement( id: string ) {
    return document.getElementById( id ) ?? fail( `Element "${id}" not found` );
}

export default function gui() {
    // Create floating button
    const menu = document.createElement("button");
    menu.id = "cnc-optimizer-btn";
    menu.innerHTML = assets.menuIcon;
    menu.title = "CNC Optimizer";
    
    // Create side panel
    const panel = document.createElement("div");
    panel.id = "cnc-optimizer-panel";
    panel.innerHTML = assets.panel;
    
    // Add styles
    const styles = document.createElement("style");
    styles.textContent = assets.styles;
    
    // Add to page
    document.body.appendChild(styles);
    document.body.appendChild(menu);
    document.body.appendChild(panel);
    
    // Event listeners
    addClick( menu, () => panel.classList.toggle("open") );
    addClick( "cnc-close-btn", () => panel.classList.remove("open") );

    return {
        autoScan: getElement( "cnc-auto-scan-btn" ),
        quickScan: getElement( "cnc-quick-scan-btn" ),
        scan: getElement( "cnc-scan-btn" ),
        sync: getElement( "cnc-sync-btn" ),
    }
}