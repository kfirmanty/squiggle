const chai = require("chai");
const expect = chai.expect;
const parser = require("../src/parser.js");

describe("Parser tests", () => {
    it("should properly parse input", () => {
        const parsed = parser.parseCode("[20 +] [2 -3 1 +]");
        expect(parsed).to.deep.equal({
            0: {
                commands: [20, "+"]
            },
            1: {
                commands: [2, -3, 1, "+"]
            }
        });
    });
});