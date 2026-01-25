type Resolver<Type> = [(value: IteratorResult<Type>) => void, (reason?: any) => void];

export default function queue<Type>() {
    const values: Type[] = [];
    const resolvers: Array<Resolver<Type>> = [];

    let index = 0;
    let done = false;
    let err: Error | null = null;

    const iterator = {
        [Symbol.asyncIterator]() {
            return {
                next(): Promise<IteratorResult<Type>> {
                    if ( index < values.length ) {
                        const value = values[index]!;

                        index += 1;

                        if ( index === values.length ) {
                            values.length = 0;
                            index = 0;
                        }
                        
                        return Promise.resolve({ value, done: false });
                    }

                    if (err) {
                        const ref = err;

                        err = null;
                        return Promise.reject(ref);
                    }

                    if (done) {
                        return Promise.resolve({ value: undefined, done: true });
                    }

                    return new Promise<IteratorResult<Type>>(
                        (resolve, reject) => resolvers.push([resolve, reject])
                    );
                },
                return(): Promise<IteratorResult<Type>> {
                    resolve();
                    return Promise.resolve({ value: undefined, done: true });
                }
            };
        }
    };

    function close( [resolve]: Resolver<Type> ) {
        resolve( { value: undefined, done: true } );
    }

    function push(value: Type) {
        if (done) return;
        
        if (resolvers.length) {
            resolvers.shift()![0]({ value, done: false });
        } else {
            values.push(value);
        }
    }

    function resolve() {
        if (done) return;

        done = true;

        if ( resolvers.length ) {
            resolvers.forEach( close );
            resolvers.length = 0;
        }
    }

    function reject(error: Error) {
        if (done) return;

        done = true;

        if ( resolvers.length ) {
            resolvers.shift()![1]( error);
            resolvers.forEach( close );
            resolvers.length = 0;
        } else {
            err = error;
        }
    }

    return { iterator, push, resolve, reject };
}