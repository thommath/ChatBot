

const aliases = {
    'average': 'avg',
    'avg': 'sum total of elem / length',
    'sum': 'acc+',
    'last': 'elem if date of elem > acc starting with string',
    'first': 'elem if date of elem <= acc starting with object',

    'date': 'bill_date',
    'element': 'elem',
    'transaction': 'elem',
    'elem': 'cur',
    'accumulator': 'acc',
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
    
    'and': '\\&\\&',
    'or': '\\|\\|',
    'not': '!',

    'of': '.',
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
const splitAndRun = (f, s, vars, from, to) => f(cleanString(s.slice(from, to)), vars);



const isFunction = s => s.indexOf('function') === 0;
const parseFunction = (s, vars) => {
    let doIndex = s.indexOf('do');
    
    console.log(s.slice(doIndex+3))

    let func = expression(s.slice(doIndex+3), vars);

    return function (...args) {
        console.log('args', args);
        return func(args);
    }
}

const isRemember = s => s.indexOf('remember') !== -1;
const parseRemember = (s, vars = {}) => {
    const asIndex = s.indexOf('as');

    let func = splitAndRun(expression, s, vars, 9, asIndex);

    vars[s.slice(asIndex+3)] = function (...args) {
        return func(args);
    };

    return vars;
}


const language = (s, vars) => {
    s = preprocess(s);

    s = cleanString(s);

    if (isFunction(s)) {
        return parseFunction(s, vars);
    }
    if (isRemember(s)) {
        return parseRemember(s, vars);
    }
    return 'error'
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
            case 'object': def = {};break;
            default: def = expression(s, vars)();
        }
        return list.reduce(splitAndRun(expression, s, vars, 0, defaultIndex-1), def);
    }
    return list.reduce(expression(s, vars), def);
}


const expression = (s, vars) => {
    s = cleanString(s);

    if (isIf(s))
        return parseIf(s, vars);
    if (isList(s))
        return parseList(s, vars)
    if (isFunc(s))
        return getFunc(s, vars);
    if (findCompareItem(s) !== undefined)
        return condition(s, vars);
    if (isOperator(s))
        return parseOperator(s, vars);
    if (!isNaN(Number(s)))
        return () => Number(s);
    if(s == 'acc') 
        return (acc, elem) => acc;
    if(s == 'cur')
        return (acc, elem) => elem;
    if(s == 'index')
        return (acc, elem, i) => i;
    if(s == 'all')
        return (acc, elem, i, all) => all;
    if(s == 'arguments' || s == 'args')
        return args => args;
    if (isVar(s, vars))
        return parseVar(s, vars);
    
    return () => s;
}

const isVar = (s, vars) => {
    if (!vars)
        return false;
    return vars[s]
}
const parseVar = (s, vars) => {
    let splitted = s.split(' ')
    console.log('parsevar: ', s)
    if (vars[s]) {
        if (typeof(vars[s]) == 'function'){

            console.log('Running fucntion:', vars[s].apply(undefined, ['meme', 'other']))
            return () => vars[s];
        }
        return () => vars[s];
    }
    return vars[s];
}

const isFunc = s => s[0] === '!' || s.indexOf('parameter') > 0;
const getFunc = (s, vars) => {
    if (s[0] == '!')
        return (acc, elem, i, all) => !splitAndRun(condition, s, vars, 1)(acc, elem, i, all);
    return (acc, elem, i, all) => {
        console.log(s);

        // Get context 
        let context = undefined;
        if (s.indexOf('.') !== -1) {
            context = splitAndRun(expression, s, vars, s.indexOf('.')+1, s.indexOf('parameter'))(acc, elem, i, all);
        }

        // Get params
        let params = s.slice(s.indexOf('parameter')).split('parameter').slice(1).map(str => {
            console.log('String:', str)
            let parsed = splitAndRun(expression, str, vars);
                return parsed(acc, elem, i, all);
        });
        console.log(params);
        console.log(typeof(splitAndRun(expression, s, vars, 0, s.indexOf('parameter'))))


        console.log('applying ', splitAndRun(expression, s, vars, 0, s.indexOf('parameter'))(acc, elem, i, all), 'on', context, 'with', params)

        return splitAndRun(expression, s, vars, 0, s.indexOf('parameter'))(acc, elem, i, all).apply(
            context,
            params
        )
    }
}

const isIf = s => s.indexOf('if') !== -1;
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
const parseIf = (s, vars) => {
    s = cleanString(s);
    let ifIndex = s.indexOf('if');

    if (ifIndex === -1) {
        return expression(s, vars);
    }
    let elseIndex = findCorrespondingElse(s);

    return (acc, elem, i, all) => {
        // Default is return acc
        if (elseIndex === -1) {
            if (splitAndRun(condition, s, vars, ifIndex+2)(acc, elem, i, all)) {
                return splitAndRun(expression, s, vars, 0, ifIndex)(acc, elem, i, all);
            }
            return acc;
        }

        if (splitAndRun(condition, s, vars, ifIndex+2, elseIndex-1)(acc, elem, i, all)) {
            return splitAndRun(expression, s, vars, 0, ifIndex)(acc, elem, i, all);
        }        
        return splitAndRun(expression, s, vars, elseIndex+4)(acc, elem, i, all);
    };
}
const getConditionMergerIndex = s => {
    let index = s.indexOf('||');
    if (index !== -1)
        return index;
    return s.indexOf('&&');
}
const hasConditionMerger = s => getConditionMergerIndex(s) !== -1;
const getConditionMerger = s => {
    let conditionMerger = s[getConditionMergerIndex(s)];
    if (conditionMerger == '&')
        return (a, b) => a && b;
    return (a, b) => a || b;    
}
const getCondition = (s, vars) => {
    return getConditionMerger(s) (
        splitAndRun(condition, s, vars, 0, getConditionMergerIndex(s)-1), 
        splitAndRun(condition, s, vars, getConditionMergerIndex(s) + 3)
    );
} 

const condition = (s, vars) => {
    if (hasConditionMerger(s))
        return getCondition(s, vars);

    // If single condition
    let compareItem = findCompareItem(s);
    if (compareItem) {
        let compareItemIndex = s.indexOf(compareItem);

        return (acc, elem, i, all) => compare(compareItem)
            (
                expression(s.slice(0, compareItemIndex-1), vars)(acc, elem, i, all),
                expression(s.slice(compareItemIndex + compareItem.length + 1), vars)(acc, elem, i, all)
            )
    } else {
        return (acc, elem, i, all) => expression(s, vars)(acc, elem, i, all);
    }
}
const findCompareItem = s => {
    let splitted = s.split(' ');
    return splitted.find(str => typeof(compare(str)) == 'function');
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

const isList = s => s[0] == '[' && s.indexOf(']') === s.length -1;
const parseList = (s, vars) => (acc, elem, i, all) => s.slice(1, s.length-1).split(', ').map(e => expression(e, vars)(acc, elem, i, all));

const operator_prioritized = s => s == '*' || s == '/' || s == '.';
const operator_not_prioritized = s => s == '+' || s == '-';

const operator = s => {
    console.log('operator', s)
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
        case '.': return (a, b) => b[a];
        default: return undefined;
    }
}

const isOperator = s => s.split('').findIndex(st => operator_not_prioritized(st)) !== -1 || s.split('').findIndex(st => operator_prioritized(st)) !== -1;
const parseOperator = (s, vars) => {
    // contains operator?
    let index = s.split('').findIndex(st => operator_not_prioritized(st));
    if (index === -1) {
        index = s.split('').findIndex(st => operator_prioritized(st));
    }
    console.log('parse operator', s, s[index])
    // Apply the operator found on both sides of the expression
    return (acc, elem, i, all) => {
        console.log(splitAndRun(expression, s, vars, 0, index) (acc, elem, i, all))
        console.log(splitAndRun(expression, s, vars, index+1) (acc, elem, i, all))
        return operator(s[index])
        (   
            splitAndRun(expression, s, vars, 0, index) (acc, elem, i, all),
            splitAndRun(expression, s, vars, index+1) (acc, elem, i, all)
        );}
}


exports.compare = compare;
exports.operator = operator;
exports.expression = expression;
exports.parseIf = parseIf;
exports.condition = condition;
exports.magiduse = magiduse;
exports.language = language;
