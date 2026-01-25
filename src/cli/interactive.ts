import { type Readings, calculate, print } from "/layout/index.ts";
import { parse } from "/layout/index.ts";
import * as Layouts from "/layout/readings.ts";
import * as Power from "/power.ts";

function report( from: String[], data: Readings ) {
    const { layout, ...rest } = data;
    const maxPower = Layouts.max("power") ?? 0;
    const efficiency = maxPower > 0 ? rest.totalPower / maxPower : null;
    const same = from.join("") === layout.join("");
    
    console.log( print(layout), "\n" );
    console.log( "To:", { ...rest, same, efficiency }, "\n" );
    console.log( layout );
}

// Interactive prompt that asks for a URL
// Press Ctrl+X to exit
async function prompt(): Promise<void> {
    console.log("Please enter a URL (Press Ctrl+X to exit):");
    console.log("---");

    // Enable raw mode to capture keypresses
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    let url = "";

    process.stdin.on("data", (key: string) => {
        const char = key.toString();

        // Check for Ctrl+X (ASCII code 24)
        if (char === "\u0018" || char === "\u0003") {
            console.log("\n\nExiting... Goodbye!");
            process.exit(0);
        }

        // Handle Enter key
        if (char === "\r" || char === "\n") {
            if (url.trim()) {
                const layout = parse( url );
                const { layout: from, ...rest } = calculate(layout);

                console.log( "\n\nFrom:", { ...rest, layout: from.join("") }, "\n" );
                console.time("optimize");
                const snap = Power.seek(layout);
                console.timeEnd("optimize");
                url = "";
                report( layout,  snap! );
                console.log("\nEnter another URL (Press Ctrl+X to exit):");
            }

            return;
        }

        // Handle Backspace
        if (char === "\u007f" || char === "\b") {
            if (url.length > 0) {
                url = url.slice(0, -1);
                process.stdout.write("\b \b");
            }

            return;
        }

        // Add printable characters to input
        if (char >= " " && char <= "~") {
            url += char;
            process.stdout.write(char);
        }
    });
}

// Start the prompt
await prompt();
