import { lock, pending, failed, unlock, fail, complete } from "/scan/scans";
import seek from "./seek";

export type Results = ReturnType<typeof process>;
export type Data = Results extends Generator<infer Type> ? Type : never;

export default function* process( type: "pending" | "failed" = "pending" ) {
    for ( const id of type === "failed" ? failed() : pending() ) {
        const scan = lock( id );

        if ( scan ) {
            const { data, world } = scan;

            try {
                for ( const city of data.cities ) {
                    if ( city.type === "base" || city.type === "camp" ) {
                        yield* seek( world, city );
                    }
                    else if ( city.type === "city" ) {
                        // @todo We need to clean up the used maps
                    }
                    else {
                        throw new Error(`Unknown city type ${ city.type }`);
                    }
                }

                complete( id );

                yield { id, completed: true } as const;
            }

            catch (err) {
                yield { id, err } as const;

                fail( id );
            }
            
            finally {
                unlock( id );
            }
        }
    }

    yield { done: true } as const;
}
