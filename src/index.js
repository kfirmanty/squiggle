const g = require("./graphics");
const vm = require("./vm");
const fs = require("fs");

const file = process.argv[2];
let desc = JSON.parse(fs.readFileSync(file))
const svm = vm.init(desc);

const stepsPerFrame = svm.width * svm.height;

for (let i = 0; i < stepsPerFrame; i++) {
    svm.squiggles.forEach(s => vm.execSquiggle(svm, s, i));
}

g.toPPM(g.blendCanvases(svm.squiggles.map(s => s.canvas), svm.blendingMode));

