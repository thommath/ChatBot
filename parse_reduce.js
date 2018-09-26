elem = {i: 4}


const something = (s, vars) => {
    const splitted = s.split(' ');
    if (splitted.length == 1) {
        if (Number(s)) {
            return () => Number(s);
        } else if(s == 'acc') {
            return (acc, elem) => acc;
        } else if (vars[s]) {
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
    return (acc, elem, i, all) => operator(s[index])
        (   
            something(s.slice(0, index-1), vars) (acc, elem, i, all), 
            something(s.slice(index+2), vars) (acc, elem, i, all)
        );
}

const variable = (s, vars) => vars[s];

const compare = s => {
    switch(s){
        case '<': return (a, b) => a < b;
        case '>': return (a, b) => a > b;
        case '==': return (a, b) => a == b;
        case '!=': return (a, b) => a != b;
        case '<=': return (a, b) => a <= b;
        case '>=': return (a, b) => a >= b;
        default: return 'error'
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

elems = [elem, elem, elem]

let sum = something('acc + i', {vi: 2})
console.log(elems.reduce(sum, 0))


console.log(elems.reduce((a, b, c, d) => a + d.length, 0))

let avg = something('acc + i / length', {});
console.log(elems.reduce(avg, 0))

exports.get_reduce_function = (s, vars) => something(s, vars);
