


const aliases = {
    'sum': 'acc+',
    'average': 'avg',
    'avg': 'acc + total / length',

    'array': 'list',
    'integer': 'int',
    'number': 'int',
    'text': 'string',
    'from': 'default',
    'starting at': 'default',
    'starting with': 'default',
    
    'times': '*',
    'mult': '*',
    'multiply': '*',
    
    'subtract': '-',
    'sub': '-',
    
    'add': '+',
    'divide': '/',
    'div': '/',
    'division': '/',

    'where': 'if',
    
    '\\&\\&': 'and',
    '\\|\\|': 'or',
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}
const preprocess = s => {
    const keys = Object.keys(aliases);
    for (let i in keys) {
        s = replaceAll(s, keys[i], aliases[keys[i]])
    }
    return s;
}

const magiduse = (list, s, vars) => {
    s = preprocess(s);

    let defaultIndex = s.indexOf('default');

    let def = 0;
    if (defaultIndex !== -1) {
        switch(s.slice(defaultIndex + 7 + 1)){
            case 'list': def = [];break;
            case 'int': def = 0;break;
            case 'string': def = '';break;
            default: def = something(s, vars)();
        }
        return list.reduce(func(s.slice(0, defaultIndex-1), vars), def);
    }
    return list.reduce(func(s, vars), def);
}

const findCorrespondingElse = s => {
    let ifs = 0;
    let index = 0;
    let splitted = s.split(' ')
    for (let i in splitted){
        let str = splitted[i];
        if (str == 'if') {
            ifs += 1;
        } else if (str == 'else') {
            ifs -= 1;
            if (ifs <= 0) {
                return index;
            }
        }
        index += str.length + 1;
    }
    return -1;
}

const func = (s, vars) => {
    s = cleanString(s);
    let ifIndex = s.indexOf('if');

    if (ifIndex === -1) {
        return something(s, vars);
    }
    let elseIndex = findCorrespondingElse(s);

    return (acc, elem, i, all) => {
        // Default is return acc
        if (elseIndex === -1) {
            if (condition(s.slice(ifIndex+2), vars)(acc, elem, i, all)) {
                return something(s.slice(0, ifIndex), vars)(acc, elem, i, all);
            }
            return acc;
        }

        if (condition(s.slice(ifIndex+2, elseIndex-1), vars)(acc, elem, i, all)) {
            return something(s.slice(0, ifIndex), vars)(acc, elem, i, all);
        }        
        return something(s.slice(elseIndex + 4), vars)(acc, elem, i, all);
    };
}

const condition = (s, vars) => {
    // Condition merger
    let conditionMergerIndex = s.indexOf('and');
    if (conditionMergerIndex !== -1) {
        return condition(s.slice(0, conditionMergerIndex-1)) && condition(s.slice(conditionMergerIndex + 4));
    }
    conditionMergerIndex = s.indexOf('or');
    if (conditionMergerIndex !== -1) {
        return condition(s.slice(0, conditionMergerIndex-1)) || condition(s.slice(conditionMergerIndex + 3));
    }

    // If single condition
    let compareItem = findCompareItem(s);
    if (compareItem) {
        let compareItemIndex = s.indexOf(compareItem);

        return (acc, elem, i, all) => compare(compareItem)
            (
                something(s.slice(0, compareItemIndex-1), vars)(acc, elem, i, all),
                something(s.slice(compareItemIndex + compareItem.length + 1), vars)(acc, elem, i, all)
            )
    } else {
        return (acc, elem, i, all) => something(s, vars)(acc, elem, i, all);
    }
}

const findCompareItem = s => {
    let splitted = s.split(' ');
    return splitted.find(str => typeof(compare(str)) == 'function');
}


const cleanString = s => {
    // Remove spaces first and last
    if (s[0] == ' ') {
        return cleanString(s.slice(1));
    }
    if (s[s.length-1] == ' ') {
        return cleanString(s.slice(0, s.length-1));
    }
    return s;
}

const something = (s, vars) => {
    s = cleanString(s);

    // If condition 
    if (s.indexOf('if') !== -1) {
        return func(s, vars);
    }

    // is list?
    const isList = s[0] == '[' && s.indexOf(']') === s.length -1;
    if (isList) {
        return (acc, elem, i, all) => s.slice(1, s.length-1).split(', ').map(e => something(e, vars)(acc, elem, i, all));
    }

    // contains operator?
    let index = s.split('').findIndex(st => operator_not_prioritized(st))
    if (index === -1) {
        index = s.split('').findIndex(st => operator_prioritized(st));
    }
    if (index !== -1) {
        // Apply the operator found on both sides of the something
        return (acc, elem, i, all) => operator(s[index])
            (   
                something(s.slice(0, index), vars) (acc, elem, i, all), 
                something(s.slice(index+1), vars) (acc, elem, i, all)
            );
    }

    if (!isNaN(Number(s))) {
        return () => Number(s);
    } else if(s == 'acc') {
        return (acc, elem) => acc;
    } else if(s == 'cur') {
        return (acc, elem) => elem;
    } else if (vars && vars[s]) {
        return () => vars[s];
    } else if (s == 'length') {
        return (acc, elem, i, all) => all.length;
    } else {
        return (acc, elem) => {
            if (elem) {
                if (!isNaN(Number(elem[s]))) {
                    return Number(elem[s]);
                } else if (elem[s] !== undefined) {
                    return elem[s];
                }
            }
            return s;
        }
    }
}

const compare = s => {
    switch(s){
        case '<': return (a, b) => a < b;
        case '>': return (a, b) => a > b;
        case '==': return (a, b) => a == b;
        case '!=': return (a, b) => a != b;
        case '<=': return (a, b) => a <= b;
        case '>=': return (a, b) => a >= b;
        default: return undefined;
    }
}

const operator_prioritized = s => s == '*' || s == '/';
const operator_not_prioritized = s => s == '+' || s == '-';

const operator = s => {
    switch(s){
        case '+': return (a, b) => {
            if (Array.isArray(a)) {
                return a.concat(b);
            }
            return a + b;
        };
        case '-': return (a, b) => a - b;
        case '*': return (a, b) => a * b;
        case '/': return (a, b) => a / b;
        default: return undefined;
    }
}

exports.compare = compare;
exports.operator = operator;
exports.something = something;
exports.func = func;
exports.condition = condition;
exports.magiduse = magiduse;
exports.get_reduce_function = (s, vars) => func(s, vars);
