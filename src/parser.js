const isGroupStart = code => code[0] == "["

const eatEnclosed = (code, endingChar) => {
    let openings = 1; //TODO: for now only top level groups will be parsed, later think how nested groups in groups etc would affect the behaviour
    let enclosedCode = "";
    let restCode = code.slice(1);
    while (restCode && restCode[0] !== endingChar) {
        enclosedCode += restCode[0];
        restCode = restCode.slice(1);
        openings -= 1;
    }
    if (!code && openings > 0) {
        throw Error("Can't find closing " + endingChar + " for code " + code);
    }
    restCode = restCode.slice(1);
    return [restCode, enclosedCode];
}

const eatGroup = code => eatEnclosed(code, "]");

const groupToCommands = code => {
    return code.split(/\s+/).map(v => isNaN(v) ? v : parseInt(v));
}

const codeToGroups = code => {
    let restCode = code.trim();
    let groups = [];
    while (restCode) {
        let [nCode, group] = eatGroup(restCode);
        groups.push(group);
        restCode = nCode.trim();
    }
    return groups;
}

const parseCode = code => {
    const groups = codeToGroups(code);
    let parsed = {};
    groups.forEach((g, i) => {
        parsed[i] = { commands: groupToCommands(g) };
    });
    return parsed;
}

exports.parseCode = parseCode;