elem = {i: 4}


const func = (s, vars) => {
    let ifIndex = s.indexOf('if');

    if (ifIndex === -1) {
        return something(s, vars);
    }

    let elseIndex = s.indexOf('else');

    return (acc, elem, i, all) => {
        if (condition(s.slice(ifIndex+3, elseIndex-1), vars)(acc, elem, i, all)) {
            console.log('tre')
            return something(s.slice(0, ifIndex-1), vars)(acc, elem, i, all);
        }
        console.log('fls')
        return something(s.slice(elseIndex + 5), vars)(acc, elem, i, all);
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

        console.log(compareItem, s.slice(0, compareItemIndex-1), s.slice(compareItemIndex + compareItem.length + 1))

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


const something = (s, vars) => {
    const splitted = s.split(' ');
    if (splitted.length == 1) {
        if (!isNaN(Number(s))) {
            return () => Number(s);
        } else if(s == 'acc') {
            return (acc, elem) => acc;
        } else if (vars && vars[s]) {
            return () => vars[s];
        } else if (s == 'length') {
            return (acc, elem, i, all) => all.length;
        } else {
            return (acc, elem) => {
                if (Number(elem[s])) {
                    return Number(elem[s]);
                } else {
                    return elem[s];
                }
            }
        }
    }

    console.log(s)
    let index = s.split('').findIndex(st => operator_not_prioritized(st))
    if (index === -1) {
        index = s.split('').findIndex(st => operator_prioritized(st));
    }
    
//    console.log((s.slice(0, index-1)), '----', s[index], '----', (s.slice(index+2)))
//    console.log(something(s.slice(0, index-1), vars)(0, elem), '----', s[index], '----', something(s.slice(index+2), vars)(0, elem))

    // Apply the operator found on both sides of the something
    console.log(s)
    return (acc, elem, i, all) => operator(s[index])
        (   
            something(s.slice(0, index-1), vars) (acc, elem, i, all), 
            something(s.slice(index+2), vars) (acc, elem, i, all)
        );
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
        case '+': return (a, b) => a + b;
        case '-': return (a, b) => a - b;
        case '*': return (a, b) => a * b;
        case '/': return (a, b) => a / b;
        default: return undefined;
    }
}

elems = [elem, elem, elem, {i: -1}, {i: 3, lol: 1}]

let sum = func('acc + i', {vi: 2})
console.log(elems.reduce(sum, 0))

let avg = func('acc + i / length if i > 0 and lol == 1 else acc', {});
console.log(elems.reduce(avg, 0))

exports.get_reduce_function = (s, vars) => something(s, vars);
