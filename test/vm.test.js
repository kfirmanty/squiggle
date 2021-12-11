const chai = require("chai");
const expect = chai.expect;
const vm = require("../src/vm.js");

describe("Parser tests", () => {
    it("should properly execute single step", () => {
        const svm = vm.init({ width: 1, height: 1, blendingMode: "ADDITIVE", squiggles: [{ code: "[3 3 3 +]" }] });
        svm.squiggles.forEach(s => vm.execSquiggle(svm, s, 0));
        expect(svm.squiggles[0].canvas).to.deep.equal(
            [[[3, 3, 3]]]
        );
    });
    it("should properly call fn", () => {
        const svm = vm.init({
            width: 1, height: 1, blendingMode: "ADDITIVE",
            squiggles: [{ code: "[10 vec3 call set]" }],
            fns: { "vec3": "dup dup" }
        });
        svm.squiggles.forEach(s => vm.execSquiggle(svm, s, 0));
        expect(svm.squiggles[0].canvas).to.deep.equal(
            [[[10, 10, 10]]]
        );
    });
});