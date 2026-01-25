
import type { Layout } from "/power/index.ts";
import { layout } from "/addon/units.ts";
import { layoutSize } from "/defaults";

const { a, p, c, t } = layout;

export default function* layouts( layout: Layout, depth = 0 ): Generator<Layout> {
    const size = Math.min( layout.length, layoutSize );

    yield layout;

    for (let from = 0; from <= size; from += 1) {
        const source = layout[from]!;

        if (source === p || source === a) {
            for (let to = 0; to < size; to += 1) {
                const target = layout[to]!;

                // Skip: same position or swapping identical unit types (p↔p, a↔a)
                if ( from === to || target === source ) continue;
                // Skip: resources are fixed in place
                if ( target === c || target === t ) continue;
                // Skip: avoid duplicate swaps (swap 0↔3 same as 3↔0, only do it once)
                if ( (target === p || target === a) && from > to ) continue;

                layout[from] = target;
                layout[to] = source;

                if ( depth > 0 ) {
                    yield* layouts(layout, depth - 1);
                }

                yield layout;

                layout[from] = source;
                layout[to] = target;
            }
        }
    }
}
