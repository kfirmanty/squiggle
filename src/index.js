const g = require("./graphics");
const vm = require("./vm");
const fs = require("fs");

const file = process.argv[2];
let frames = process.argv[3] ? parseInt(process.argv[3]) : 1;
let desc = JSON.parse(fs.readFileSync(file))
const svm = vm.init(desc);
const sync = process.argv[4];

const stepsPerFrame = svm.width * svm.height;

svm.squiggles.forEach(s => vm.execCommands(s, 0, s.init));

for (let frame = 0; frame < frames; frame++) {
    for (let i = 0; i < stepsPerFrame; i++) {
        svm.squiggles.forEach(s => vm.execSquiggle(svm, s, i));
    }
    if (sync) {
        svm.squiggles.forEach(s => (s.position = [0, 0, 0]));
    }
    g.toPPM(g.blendCanvases(svm.squiggles.map(s => s.canvas), svm.blendingMode), frame);
}

