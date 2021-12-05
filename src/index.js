const g = require("./graphics");
const fs = require("fs");
const parser = require("./parser");

const createSquiggle = (desc, s) => {
    const groups = parser.parseCode(s.code);
    const dir = s.dir ? s.dir : [1, 0];
    const manualMove = s.manualMove ? s.manualMove : false;
    return {
        groups, dir, manualMove,
        rgb: [0, 0, 0],
        rgbIncrement: [1, 1, 1],
        canvas: g.createCanvas(desc.width, desc.height),
        position: [0, 0],
        groupToExecute: 0
    };
}

const file = process.argv[2];
const desc = JSON.parse(fs.readFileSync(file));
desc.squiggles = desc.squiggles.map(s => createSquiggle(desc, s));

const stepsPerFrame = desc.width * desc.height;

const constraint = (position, width, height) => {
    let x = position[0];
    let y = position[1];
    if (x < 0) {
        x = width + x;
        y -= 1;
    } else if (x >= width) {
        x = x % width;
        y += 1;
    }

    if (y < 0) {
        y = height + y;
    } else if (y >= height) {
        y = y % height;
    }
    return [x, y];
}

const execSquiggle = (desc, s) => {
    const commands = s.groups[s.groupToExecute].commands;
    commands.forEach(c => {
        switch (c.command) {
            case "+":
                if (c.args) {
                    if (c.args.length == 1) {
                        let val = c.args[0]
                        s.rgbIncrement = [val, val, val];
                    } else {
                        s.rgbIncrement = [c.args[0], c.args[1], c.args[2]];
                    }
                }
                s.rgb = g.addRGB(s.rgb, s.rgbIncrement);
                break;
        }
    });
    g.setPixel(s.canvas, s.position[0], s.position[1], s.rgb);
    s.position = [s.position[0] + s.dir[0], s.position[1] + s.dir[1]];
    s.position = constraint(s.position, desc.width, desc.height);
    s.groupToExecute = (s.groupToExecute + 1) % Object.keys(s.groups).length;
}

for (let i = 0; i < stepsPerFrame; i++) {
    desc.squiggles.forEach(s => execSquiggle(desc, s));
}

g.toPPM(g.blendCanvases(desc.squiggles.map(s => s.canvas), desc.blendingMode));

