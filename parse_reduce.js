



class Environement{

    constructor(vars = {}) {
        this.vars = vars;
    }

    setVars(vars) {
        this.vars = Object.assign(this.vars, vars);
    }
    getVars() {
        return this.vars;
    }
    getFunction(s) {
        return expression(s, this.vars);
    }
}

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
const splitAndRun = (f, s, vars, from, to) => {
    // console.log('running: ', s.slice(from, to), 'on', f.name);
    return f(cleanString(s.slice(from, to)), vars)
};

const isInsideQuotes = (s, index) => {
    let splitted = s.split('quote');
    let length = splitted[0];
    
    if (index < splitted[0].length)
        return false;

    for (let i = 1; i < splitted.length; i++){
        if (getIndexOfCorrespondingEnd(s.slice(length), 'quote', 'endquote') > index)
            return true;

        length += splitted[i];
    }
    return false;
}

const getIndexOfCorrespondingEnd = (s, startString, endString) => {
    // Find end of quote in string from 'quote hei på deg quote din nisse endquote endquote'
    // Find end of if in string from 'if 123 < 345 else'
    let depth = 0;
    let index = 0;
    let splitted = s.split(' ')
    for (let i in splitted){
        if (splitted[i] === startString)// && !isInsideQuotes(s, index))
            depth++;
        if (splitted[i] === endString){//} && !isInsideQuotes(s, index)) {
            depth--;
            if (depth <= 0)
                return index;
        }
        index += splitted[i].length + 1;
    }
    return -1; // No corresponding end
}

const expression = (s, vars) => {
    s = cleanString(s);

    if (isThen(s))
        return parseThen(s, vars);

    if (isFunction(s))
        return parseFunction(s, vars);

    if (isWhile(s))
        return parseWhile(s, vars);

    if (isAlso(s))
        return parseAlso(s, vars);

    if (isRemember(s))
        return parseRemember(s, vars);

    if (isFunc(s))
        return getFunc(s, vars);

    if (isIf(s))
        return parseIf(s, vars);

    if (findCompareItem(s) !== undefined)
        return condition(s, vars);

    if (isOperator(s))
        return parseOperator(s, vars);
        
    if (isList(s))
        return parseList(s, vars)

    if (!isNaN(Number(s)))
        return () => Number(s);

    if (isVar(s, vars))
        return () => parseVar(s, vars);

    // TODO: Add function to parse numbers

    if (this[s] !== undefined) // REMOVE NOT SAFE, it can refer to environement variables...
        return () => this[s];
    if (s === 'arguments' || s === 'args')
        return args => args;

    if (isQuote(s))
        return parseQuote(s, vars);
    
    return () => s;
}

const isFunction = s => s.indexOf('function') === 0 && !isInsideQuotes(s, s.indexOf('function'));
const isThen = s => s.indexOf('then') !== -1 && !isInsideQuotes(s, s.indexOf('then'));
const isRemember = s => s.indexOf('remember') === 0 && !isInsideQuotes(s, s.indexOf('remember'));
const isAlso = s => s.indexOf('also') !== -1 && !isInsideQuotes(s, s.indexOf('also'));
const isWhile = s => s.indexOf('while') === 0 && !isInsideQuotes(s, s.indexOf('while'));
const isVar = (s, vars) => {
    if (!vars)
        return false;
    return vars[s] !== undefined
}
const isFunc = s => s.indexOf('run') === 0 && !isInsideQuotes(s, s.indexOf('run'));
const isIf = s => s.indexOf('if') !== -1 && !isInsideQuotes(s, s.indexOf('if'));
const isList = s => s[0] == '[' && s.indexOf(']') === s.length -1 && !isInsideQuotes(s, s.indexOf('['));
const isOperator = s => (s.split('').findIndex(st => operator_not_prioritized(st)) !== -1 && !isInsideQuotes(s, s.split('').findIndex(st => operator_not_prioritized(st))))|| 
                        (s.split('').findIndex(st => operator_prioritized(st)) !== -1 && !isInsideQuotes(s, s.split('').findIndex(st => operator_prioritized(st))));
const isQuote = s => s.indexOf('quote') === 0;

const parseQuote = (s, vars) => {
    // this does not account for anything that is after the quotes end, this code will not be evaluated
    const endOfQuote = getIndexOfCorrespondingEnd(s, 'quote', 'endquote');
    return () => s.slice(6, endOfQuote-1);
}

const parseFunction = (s, vars) => {
    let doIndex = s.indexOf('do');
    
    // console.log(s.slice(doIndex+3))

    
    return function (...args) {
        // console.log('arguments in to parseFunction', args);
        // console.log('string to parse:', s.slice(doIndex+3))
        let func = expression(s.slice(doIndex+3), vars);
        if(!func)
            throw "Expression is not an function"
        // console.log('f', func.toString(), func)
        return func(args);
    }
}

const parseRemember = (s, vars = {}) => {
    const asIndex = getIndexOfCorrespondingEnd(s, 'remember', 'as');

    return () => {
        let func = splitAndRun(expression, s, vars, 9, asIndex);    
        vars[s.slice(asIndex+3)] = func;
        return func;
    };
}

const parseThen = (s, vars) => {
    let splitted = s.split('then');
    let res;

    for (let i = 0; i < splitted.length; i++) {
        res = splitAndRun(expression, splitted[i], vars);
        // if (typeof(res) === 'object') {
        //     vars = res;
        // }
        // console.log('arguments from them', vars)
    }
    return res;
}
const parseAlso = (s, vars) => {
    let splitted = s.split('also');
    let res;

    for (let i = 0; i < splitted.length; i++) {
        res = splitAndRun(expression, splitted[i], vars);
        if (typeof(res) === 'object') {
            vars = res;
        }
    }
    return res;
}

const parseWhile = (s, vars) => {
    const doIndex = s.indexOf('do');
    const cond = splitAndRun(condition, s, vars, 6, doIndex);

    return (args) => {
        let ret;
        while(cond(args, vars)) {
            ret = splitAndRun(expression, s, vars, doIndex+3);
        }
        return ret;
    };

}


const parseVar = (s, vars) => {
    return vars[s];
}

const getFunc = (s, vars) => {
    // if (s[0] == '!')
    //     return (acc, elem, i, all) => !splitAndRun(condition, s, vars, 1)(acc, elem, i, all);
    
    // console.log(s);

    if (s.indexOf('run') === 0)
        s = s.slice(4);

    let params = [];
    let to = s.length;
    if (s.indexOf('parameter') >= 0) {
        // Get params
        params = s.slice(s.indexOf('parameter')).split('parameter').slice(1).map(str => {
            let parsed = splitAndRun(expression, str, vars);

            // If function
            if (str.indexOf('function') < 5 && str.indexOf('function') > -1) {
                // console.log('is Functions', str)
                return parsed;
            }
            // else
            return parsed();
        });
        to = s.indexOf('parameter');
    }

    let func = splitAndRun(expression, s, vars, 0, to);

    try {
        if(typeof(func()) === 'function'){
            func = func();
        }
    } catch (error) {
        
    }

    // Get context 
    let context = undefined;
    if (s.indexOf('.') !== -1) {
        context = splitAndRun(expression, s, vars, s.indexOf('.')+1, to)();
        // func = func();
    }

    // console.log('applying ', func, 'on', context, 'with', params)

    return func.apply(
        context,
        params
    )
}

const parseIf = (s, vars) => {
    s = cleanString(s);
    let ifIndex = s.indexOf('if');

    if (ifIndex === -1) {
        return expression(s, vars);
    }
    let elseIndex = getIndexOfCorrespondingEnd(s, 'if', 'else');

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

const parseList = (s, vars) => (acc, elem, i, all) => s.slice(1, s.length-1).split(', ').map(e => expression(e, vars)(acc, elem, i, all));

const operator_prioritized = s => s == '*' || s == '/' || s == '.';
const operator_not_prioritized = s => s == '+' || s == '-';

const operator = s => {
    // console.log('operator', s)
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

const parseOperator = (s, vars) => {
    // contains operator?
    let index = s.split('').findIndex(st => operator_not_prioritized(st));
    if (index === -1) {
        index = s.split('').findIndex(st => operator_prioritized(st));
    }
    // console.log('parse operator', s, ', operator:', s[index])
    // Apply the operator found on both sides of the expression
    // should be ...args
    return (args) => {
        // console.log(s)
        // console.log('left', splitAndRun(expression, s, vars, 0, index) (args))
        // console.log('right', splitAndRun(expression, s, vars, index+1) (args))
        // console.log('returns', operator(s[index])
        // (   
        //     splitAndRun(expression, s, vars, 0, index),
        //     splitAndRun(expression, s, vars, index+1)
        // ))
        // console.log('arguments on operator', args)
        return operator(s[index])
        (
            splitAndRun(expression, s, vars, 0, index) (args),
            splitAndRun(expression, s, vars, index+1) (args)
        );}
}


exports.compare = compare;
exports.operator = operator;
exports.expression = expression;
exports.parseIf = parseIf;
exports.condition = condition;
exports.Environement = Environement;