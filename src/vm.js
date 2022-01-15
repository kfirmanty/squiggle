const g = require("./graphics");
const parser = require("./parser");

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

const takeN = (squiggle, n) => {
    let result = [];
    for (let i = n; i > 0; i--) {
        result.push(squiggle.stack.shift());
    }
    return result;
}

const execCommands = (s, tick, commands) => {
    commands.forEach(c => {
        switch (c) {
            case "+":
                s.rgb = g.addRGB(s.rgb, takeN(s, 3));
                break;
            case "x":
                s.stack.unshift(s.position[0]);
                break;
            case "y":
                s.stack.unshift(s.position[1]);
                break;
            case "r":
                s.stack.unshift(s.rgb[0]);
                break;
            case "g":
                s.stack.unshift(s.rgb[1]);
                break;
            case "b":
                s.stack.unshift(s.rgb[2]);
                break;
            case "set":
                s.rgb = takeN(s, 3).map(g.constraintVal);
                break;
            case "add": {
                let [v1, v2] = takeN(s, 2);
                s.stack.unshift(v1 + v2)
                break;
            }
            case "sub": {
                let [v1, v2] = takeN(s, 2);
                s.stack.unshift(v1 - v2)
                break;
            }
            case "mult": {
                let [v1, v2] = takeN(s, 2);
                s.stack.unshift(v1 * v2)
                break;
            }
            case "div": {
                let [v1, v2] = takeN(s, 2);
                s.stack.unshift(v1 / v2)
                break;
            }
            case "mod": {
                let [v1, v2] = takeN(s, 2);
                s.stack.unshift(v1 % v2);
                break;
            }
            case "sin":
                s.stack.unshift(Math.sin(s.stack.shift()));
                break;
            case "dist": {
                let [v1, v2] = takeN(s, 2);
                let distX = s.position[0] - v1;
                let distY = s.position[1] - v2;
                s.stack.unshift(Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2)));
                break;
            }
            case "dup":
                s.stack.unshift(s.stack[0]);
                break;
            case "irandBi":
                s.stack.unshift(Math.floor((Math.random() - 0.5) * 2 * (s.stack.shift() + 1)));
                break;
            case "irand":
                s.stack.unshift(Math.floor(Math.random() * (s.stack.shift() + 1)));
                break;
            case "dir": {
                s.dir = takeN(s, 2);
                break;
            }
            case "t":
                s.stack.unshift(tick);
                break;
            case ">":
            case "=":
            case "<":
            case "<=":
            case ">=":
            case "and":
            case "or": {
                const [v1, v2] = takeN(s, 2);
                let testResult;
                if (c == ">") {
                    testResult = v1 > v2;
                } else if (c == "<") {
                    testResult = v1 < v2;
                } else if (c == "=") {
                    testResult = v1 == v2;
                } else if (c == ">=") {
                    testResult = v1 >= v2;
                } else if (c == "<=") {
                    testResult = v1 <= v2;
                } else if (c == "and") {
                    testResult = v1 && v2;
                } else if (c == "or") {
                    testResult = v1 || v2;
                }
                s.stack.unshift(testResult);
                break;
            }
            case "if": {
                const [testVal, ifTrue, ifFalse] = takeN(s, 3);
                //console.log("IF", testVal, ifTrue, ifFalse);
                if (testVal) {
                    execCommands(s, tick, ifTrue);
                } else {
                    execCommands(s, tick, ifFalse);
                }
                break;
            }
            case "call":
                const fn = s.stack.shift();
                if (!s.fns[fn]) {
                    throw Error("Unknown fn name!:", fn);
                }
                execCommands(s, tick, s.fns[fn].commands);
                break;
            case "setv": {
                const [varName, v] = takeN(s, 2);
                s.variables[varName] = v;
                break;
            }
            case "getv": {
                const varName = s.stack.shift();
                const value = s.variables[varName];
                if (value) {
                    s.stack.unshift(value);
                } else {
                    throw Error("Trying to access unknown variable: " + varName);
                }
                break;
            }
            case "nop":
                break;
            default:
                s.stack.unshift(c);
                break;
        }
    });
}

const execSquiggle = (svm, s, tick) => {
    const group = s.groups[s.groupToExecute];
    const commands = group.commands;
    execCommands(s, tick, commands);
    g.setPixel(s);
    s.position = [s.position[0] + s.dir[0], s.position[1] + s.dir[1]];
    s.position = constraint(s.position, svm.width, svm.height);
    s.groupCountdown = s.groupCountdown - 1;
    if (s.groupCountdown == 0) {
        s.groupToExecute = (s.groupToExecute + 1) % Object.keys(s.groups).length;
        s.groupCountdown = s.groups[s.groupToExecute].repetitions;
    }
}

const createSquiggle = (desc, s) => {
    const groups = parser.parseCode(s.code);
    const init = parser.parseFn("", s.init ? s.init : "nop").commands;
    const dir = s.dir ? s.dir : [1, 0];
    const manualMove = s.manualMove ? s.manualMove : false;
    const colorMode = s.colorMode ? s.colorMode : "RGB";
    return {
        groups, dir, manualMove,
        rgb: [0, 0, 0],
        canvas: g.createCanvas(desc.width, desc.height),
        position: [0, 0],
        groupToExecute: 0,
        groupCountdown: groups[0].repetitions,
        stack: [],
        fns: desc.fns,
        variables: {},
        init,
        colorMode
    };
}

const init = desc => {
    if (desc.fns) {
        let parsedFns = {};
        Object.keys(desc.fns).forEach(k => {
            parsedFns[k] = parser.parseFn(k, desc.fns[k]);
        });
        desc.fns = parsedFns;
    }

    desc.squiggles = desc.squiggles.map(s => createSquiggle(desc, s));
    return desc;
}

exports.init = init;
exports.execSquiggle = execSquiggle;
exports.execCommands = execCommands;