//mocked for now, just testing how the output will look for hardcoded behaviour
const fs = require("fs");

const ADDITIVE_MODE = "ADDITIVE";
const WIDTH = 256;
const HEIGHT = 256;
const MAX_VAL = 256;

const createCanvas = (width, height, toCopy) => {
    const canvas = new Array(height);
    for (let y = 0; y < canvas.length; y++) {
        canvas[y] = new Array(width);
        if (toCopy) {
            for (let x = 0; x < width; x++) {
                canvas[y][x] = toCopy[y][x]
            }
        }
    }
    return canvas;
}

const zipWith = (fn, m1, m2) => {
    return m1.map((v, i) => fn(v, m2[i]));
}

const constraintVal = v => {
    let nv = v % MAX_VAL;
    if (nv < 0) {
        nv = MAX_VAL + nv;
    }
    return nv;
}

const addRGB = (rgb1, rgb2) => {
    return zipWith(((v1, v2) => constraintVal(v1 + v2)), rgb1, rgb2);
}

const subRGB = (rgb1, rgb2) => {
    return zipWith(((v1, v2) => constraintVal(v1 - v2)), rgb1, rgb2);
}

const blendCanvases = (cs, mode) => {
    [fc, ...cs] = cs;
    const output = createCanvas(fc[0].length, fc.length, fc);

    for (let y = 0; y < fc.length; y++) {
        for (let x = 0; x < fc[0].length; x++) {
            const fn = mode == ADDITIVE_MODE ? (v1, v2) => addRGB(v1, v2) : (v1, v2) => subRGB(v1, v2);
            if (cs) {
                cs.forEach(c => {
                    output[y][x] = fn(output[y][x], c[y][x]);
                });
            }
        }
    }
    return output;
}

const toPPM = canvas => {
    const preambule = "P3\n" + WIDTH + " " + HEIGHT + "\n" + MAX_VAL + "\n";
    let pixels = ""
    for (let y = 0; y < canvas.length; y++) {
        for (let x = 0; x < canvas[0].length; x++) {
            const [r, g, b] = canvas[y][x];
            pixels += r + " " + g + " " + b + " ";
        }
        pixels += "\n";
    }
    fs.writeFileSync("output.ppm", preambule + pixels);
}

const c1 = createCanvas(WIDTH, HEIGHT);
const c2 = createCanvas(WIDTH, HEIGHT);
let mem1 = [0, 0, 0];
let mem2 = [0, 0, 0];
let frame = 0;
for (let y = 0; y < c1.length; y++) {
    for (let x = 0; x < c1[0].length; x++) {
        mem1 = addRGB(mem1, [2, 2, 2]);
        c1[y][x] = [mem1[0], mem1[1], mem1[2]];
        frame += 1;
        if (frame % 2 == 0) {
            mem2 = addRGB(mem2, [-2, -2, 1]);
        } else {
            mem2 = addRGB(mem2, [2, 1, -3]);
        }
        c2[y][x] = [mem2[0], mem2[1], mem2[2]];
    }
}

const outCanvas = blendCanvases([c1, c2], ADDITIVE_MODE);
toPPM(outCanvas);