import { layoutSize, gridCols } from "/defaults.ts";

const offsets = [
    [ -9, -8, 1, 9, 10 ],
    [ -10, -9, -8, -1, 1, 8, 9, 10 ],
    [ -10, -9, -8, -1, 1, 8, 9, 10 ],
    [ -10, -9, -8, -1, 1, 8, 9, 10 ],
    [ -10, -9, -8, -1, 1, 8, 9, 10 ],
    [ -10, -9, -8, -1, 1, 8, 9, 10 ],
    [ -10, -9, -8, -1, 1, 8, 9, 10 ],
    [ -10, -9, -8, -1, 1, 8, 9, 10 ],
    [ -10, -9, -1, 8, 9 ],
] as const;

function valid( index: number ) {
    return index >= 0 && index <= layoutSize;
}

function* getOffsets() {
    for (let index = 0; index <= layoutSize; index++) {
        yield offsets[index % gridCols]!.map(offset => index + offset).filter(valid);
    }
}

export default Array.from(getOffsets());