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
        canvas: g.createCanvas(desc.width, desc.height),
        position: [0, 0],
        groupToExecute: 0,
        groupCountdown: groups[0].repetitions,
        stack: [],
    };
}

const init = file => {
    const desc = JSON.parse(fs.readFileSync(file));
    desc.squiggles = desc.squiggles.map(s => createSquiggle(desc, s));

    if (desc.fns) {
        let parsedFns = {};
        Object.keys(desc.fns).forEach(k => {
            parsedFns[k] = parser.parseFn(k, desc.fns[k]);
        });
        desc.fns = parsedFns;
    }
    return desc;
}

exports.init = init;