/**
 * Recursively searches through an object tree to find specific search term.
 * Useful for finding obfuscated keys in minified/obfuscated code.
 *
 * @param obj - The object to search through
 * @param searchTerm - The term to search for in function bodies (e.g., "VBDCPW")
 * @param path - Current path in the object tree (for logging)
 * @param visited - Set of already-visited objects to prevent infinite loops
 */
export function find(
    obj: any,
    searchTerm: string,
    path: string = "root",
    visited: Set<any> = new Set()
): void {
    // Skip primitives, null, undefined, or already visited objects
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return;
    if (visited.has(obj)) return;

    // Mark this object as visited
    visited.add(obj);

    try {
        // Get all own property names (including non-enumerable)
        const ownKeys = Object.getOwnPropertyNames(obj);

        for (const key of ownKeys) {
            try {
                const value = obj[key];
                const currentPath = `${path}.${key}`;

                // If it's a function, convert to string and search
                if (typeof value === "function") {
                    try {
                        const funcString = value.toString();
                        if (funcString.includes(searchTerm)) {
                            console.log("=".repeat(70));
                            console.log(`🎯 FOUND: "${searchTerm}"`);
                            console.log(`📍 Path: ${currentPath}`);
                            console.log(`🔧 Function: ${key}`);
                            console.log(`📝 Preview: ${funcString.slice(0, 200)}...`);
                            console.log("=".repeat(70));
                        }
                    } catch (e) {
                        // Some native functions can't be converted to string, skip them
                    }

                    // Functions are objects too - check their properties
                    if (!visited.has(value)) {
                        find(value, searchTerm, currentPath, visited);
                    }
                }

                // Recurse into nested objects
                if (typeof value === "object" && value !== null) {
                    find(value, searchTerm, currentPath, visited);
                }
            } catch (e) {
                // Skip properties that throw on access (getters, etc)
            }
        }

        // Check the prototype chain
        try {
            const proto = Object.getPrototypeOf(obj);
            if (proto && proto !== Object.prototype && !visited.has(proto)) {
                find(proto, searchTerm, `${path}[[Prototype]]`, visited);
            }
        } catch (e) {
            // Ignore prototype access errors
        }

        // If it's a constructor function, also check its .prototype property
        if (typeof obj === "function" && obj.prototype && !visited.has(obj.prototype)) {
            find(obj.prototype, searchTerm, `${path}.prototype`, visited);
        }
    } catch (e) {
        // Handle any unexpected errors in traversal
    }
}