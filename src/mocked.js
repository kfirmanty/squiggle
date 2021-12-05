//mocked for now, just testing how the output will look for hardcoded behaviour
const g = require("./graphics");

const WIDTH = 256;
const HEIGHT = 256;

const c1 = g.createCanvas(WIDTH, HEIGHT);
const c2 = g.createCanvas(WIDTH, HEIGHT);
let mem1 = [0, 0, 0];
let mem2 = [0, 0, 0];
let frame = 0;
for (let y = 0; y < c1.length; y++) {
    for (let x = 0; x < c1[0].length; x++) {
        mem1 = g.addRGB(mem1, [2, 2, 2]);
        c1[y][x] = [mem1[0], mem1[1], mem1[2]];
        frame += 1;
        if (frame % 2 == 0) {
            mem2 = g.addRGB(mem2, [-2, -2, 1]);
        } else {
            mem2 = g.addRGB(mem2, [2, 1, -3]);
        }
        c2[y][x] = [mem2[0], mem2[1], mem2[2]];
    }
}

const outCanvas = g.blendCanvases([c1, c2], g.constants.ADDITIVE_MODE);
g.toPPM(outCanvas);