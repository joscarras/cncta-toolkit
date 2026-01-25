import type { Api } from "/addon/api.ts";
import * as Upload from "/addon/upload.ts";

export function sync( api: Api, button: HTMLElement ) {
    button.addEventListener('click', async () => {
        if (button.hasAttribute('disabled')) return;
        
        const originalText = button.textContent;
        button.setAttribute('disabled', 'true');
        button.textContent = '⏳ Loading...';
        
        try {
            const count = await Upload.sync( api );
            button.textContent = `✓ Loaded ${count}`;

            setTimeout(() => {
                button.textContent = originalText;
                button.removeAttribute('disabled');
            }, 2000);

        } catch (error) {
            button.textContent = '❌ Error';
            console.error('CNCAddon Load Error:', error);
            setTimeout(() => {
                button.textContent = originalText;
                button.removeAttribute('disabled');
            }, 2000);
        }
    });
}

export function scan( api: Api, button: HTMLElement, options: Upload.Options = {} ) {
    button.addEventListener('click', async () => {
        // Prevent multiple simultaneous scans
        if (button.hasAttribute('disabled')) return;

        // Reset classes and set running state
        button.classList.remove('success', 'error', 'active');
        button.classList.add('running');
        button.setAttribute('disabled', 'true');
        button.textContent = '⏳ Starting...';

        let scanned = 0;

        try {
            await Upload.sync( api );

            for await ( const { count, total } of Upload.scan( api, options ) ) {
                // Update progress on each yield
                button.textContent = `⏳ ${count}/${total}`;
                scanned = count;
            }

            await Upload.sync( api );

            // Success - show green with count
            button.classList.remove('running');
            button.classList.add('success');
            button.textContent = `✓ Scanned ${scanned} bases`;

            // Revert to active color after 10 seconds but keep the text
            setTimeout(() => {
                button.classList.remove('success');
            }, 10000);

        } catch (error) {
            // Error - make button red and log to console
            button.classList.remove('running');
            button.classList.add('error');
            button.textContent = '❌ Error';
            console.error('CNCAddon Scan Error:', error);

            // Revert to active color after 10 seconds but keep the text
            setTimeout(() => {
                button.classList.remove('error');
            }, 10000);
        } finally {
            // Re-enable button
            button.removeAttribute('disabled');
        }
    });
}


export function autoScan( api: Api, button: HTMLElement, options: Upload.Options = {} ) {
    let interval: NodeJS.Timeout | null = null;
    
    button.addEventListener('click', async () => {
        if ( interval ) {
            // Stop the auto scan
            clearInterval( interval );
            interval = null;
            
            // Reset to blue (default state)
            button.classList.remove('active', 'running', 'success', 'error');
            button.textContent = '🔄 Auto Scan';
        } else {
            // Start the auto scan
            button.classList.add('active');
            button.textContent = '🔄 Auto Scan Active';
            
            // Set up interval to scan every hour
            interval = setInterval( async () => {
                // Reset classes and set running state
                button.classList.remove('success', 'error', 'active');
                button.classList.add('running');
                button.setAttribute('disabled', 'true');
                button.textContent = '⏳ Starting...';

                let scanned = 0;

                try {
                    for await ( const { count, total } of Upload.scan( api, options ) ) {
                        // Update progress on each yield
                        button.textContent = `⏳ ${count}/${total}`;
                        scanned = count;
                    }

                    // Success - show green with count
                    button.classList.remove('running');
                    button.classList.add('success');
                    button.textContent = `✓ Scanned ${scanned} bases`;

                    // Revert to active color after 10 seconds but keep the text
                    setTimeout(() => {
                        if (interval) { // Only revert if autoscan is still active
                            button.classList.remove('success');
                            button.classList.add('active');
                        }
                    }, 10000);

                } catch (error) {
                    // Error - make button red and log to console
                    button.classList.remove('running');
                    button.classList.add('error');
                    button.textContent = '❌ Error';
                    console.error('CNCAddon Scan Error:', error);

                    // Revert to active color after 10 seconds but keep the text
                    setTimeout(() => {
                        if (interval) { // Only revert if autoscan is still active
                            button.classList.remove('error');
                            button.classList.add('active');
                        }
                    }, 10000);
                } finally {
                    // Re-enable button
                    button.removeAttribute('disabled');
                }
            }, 1000 * 60 * 30 ); // 30 minutes
        }
    } );
}