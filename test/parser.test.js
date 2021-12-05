const chai = require("chai");
const expect = chai.expect;
const parser = require("../src/parser.js");

describe("Parser tests", () => {
    it("should properly parse input", () => {
        const parsed = parser.parseCode("[+(20)] [+(1 -3 2)]");
        expect(parsed).to.deep.equal({
            0: {
                commands: [{
                    command: "+",
                    args: [20]
                }]
            },
            1: {
                commands: [{
                    command: "+",
                    args: [1, -3, 2]
                }]
            }
        });
    });
});