// Testing 
var expect = require('chai').expect
  , foo = 'bar'
  , beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

const { operator, compare, parseIf, condition, magiduse, expression } = require('../parse_reduce');


  describe('operator', () => {
    it('should reurn a function with two parameters that operates on them', () => {
        let func = operator('+');
        expect(func(1, 2)).to.equal(3);
        expect(func(2, 6)).to.equal(8);
        func = operator('-');
        expect(func(1, 2)).to.equal(-1);
        expect(func(2, 6)).to.equal(-4);
        func = operator('*');
        expect(func(1, 2)).to.equal(1*2);
        expect(func(2, 6)).to.equal(2*6);
        func = operator('/');
        expect(func(1, 2)).to.equal(0.5);
        expect(func(2, 6)).to.equal(2/6);
    });
    it('should merge lists', () => {
        let func = operator('+');
        expect(func([1, 2], [3, 4]).length).to.equal(4);
    })
})
describe('compare', () => {
    it('should reurn a function with two parameters that compares them', () => {
        let func = compare('<');
        expect(func(1, 2)).to.be.true;
        expect(func(7, 6)).to.be.false;
        func = compare('>');
        expect(func(1, 2)).to.be.false;
        expect(func(7, 6)).to.be.true;
        func = compare('==');
        expect(func(1, 2)).to.be.false;
        expect(func(7, 7)).to.be.true;
    });
})
describe('expression', () => {
    it('should return a property of variable', () => {
        let func = expression('property . cur');
        expect(func(0, {property: 2})).to.equal(2);
    });
    it('should return a number', () => {
        let func = expression('2');
        expect(func()).to.equal(2);
    });
    it('should return a variable', () => {
        let func = expression('i', {i: 2});
        expect(func()).to.equal(2);
    });
    it('should return a string', () => {
        let func = expression('hello');
        expect(func()).to.equal('hello');
    });
    it('should calculate an simple expression', () => {
        let func = expression('i+2/2-1', {i: 2});
        expect(func()).to.equal(2);
    });
    it('should return a list', () => {
        let func = expression('i+i', {i: [2]});
        expect(func().length).to.equal(2);
    })
    it('should parse and add lists', () => {
        let func = expression('[i]+[i]', {i: 2});
        expect(func().length).to.equal(2);
        expect(func()[0]).to.equal(2);
    })
    it('should work with or without spaces', () => {
        let func = expression('i     +i', {i: 2});
        expect(func()).to.equal(4);
    });
    it('should check for if and handle it', () => {
        let func = expression('1 if 1 else 0');
        expect(func()).to.equal(1);
    })
    it('should check for serialized if and handle it', () => {
        let func = expression('1 if 0 else 0 if 0 else 2');
        expect(func()).to.equal(2);
        func = expression('1 if 0 else 0 if 1 else 2');
        expect(func()).to.equal(0);
    })
    it('should check for nested if and handle it', () => {
        let func = expression('1 if 0 if 1 else 1 else 0 if 0 else 2');
        expect(func()).to.equal(2);
        func = expression('1 if 1 if 0 else 0 else 0 if 1 else 2');
        expect(func()).to.equal(0);
        func = expression('1 if 1 if 1+0 else 0 else 0 if 1 else 2');
        expect(func()).to.equal(1);
    })
    // it('should check for not and handle it', () => {
    //     let func = expression('1 if run not parameter run 1 else 0', {not: (a) => !a});
    //     expect(func()).to.equal(0);
    // })
    it('should handle property of', () => {
        let func = expression('total . cur');
        expect(func(0, {total: 15})).to.equal(15);
    })
    it('should run functions', () => {
        let func = expression('run print', {print:() => 'hey'});
        expect(func()).to.equal('hey');
    })
    it('should run functions with arguments', () => {
        let func = expression('run run printParam parameter Thomas', {printParam:(e) => 'hey ' + e});
        expect(func).to.equal('hey Thomas');
    })
    
    it('should run functions with arguments', () => {
        let func = expression('run run welcome parameter Thomas parameter Carl', {welcome:(a, b) => `Welcome ${a} and ${b}`});
        expect(func).to.equal('Welcome Thomas and Carl');
    })
    it('should run functions with arguments', () => {
        let func = expression('run run welcome parameter Thomas parameter Carl', {welcome:(a, b) => `Welcome ${a} and ${b}`});
        expect(func).to.equal('Welcome Thomas and Carl');
    })
    it('should run reduce on list from vars with function from vars', () => {
        let func = expression('run reduce . list parameter welcome parameter 1', {list: [1, 2, 3], welcome: (a, b) => a + b});
        expect(func).to.equal(7);
    })
    it('should be able to run multiple expression in succession', () => {
        let filter = expression('acc < 0');
        let res = expression('run filter . list parameter f', {list: [1, 2, 3, -1, -2], f: filter});
        expect(res.toString()).to.equal('-1,-2')
    })

});
describe('condition', () => {
    it('should return expression', () => {
        let func = condition('2');
        expect(func()).to.equal(2);
    });
    it('should return result of comparison', () => {
        let func = condition('2 == 2');
        expect(func()).to.be.true;
        func = condition('2 > 2');
        expect(func()).to.be.false;
    });
    it('should return result of or', () => {
        let func = condition('2 == 2 || 1 > 2');
        expect(func()).to.be.true;
    });
    it('should return result of and', () => {
        func = condition('2 == 2 && 1 < 2');
        expect(func()).to.be.true;
    });
});
describe('func', () => {
    it('should return expression based on condition', () => {
        let f = parseIf('2 if 2 < 1 else 3');
        expect(f()).to.equal(3);
        f = parseIf('2 if 2 > 1 else 3');
        expect(f()).to.equal(2);
    });
    it('should use acc as default else', () => {
        let f = parseIf('2 if 2 < 1');
        expect(f(3)).to.equal(3);
        f = parseIf('2 if 2 > 1');
        expect(f(3)).to.equal(2);
    })
});

describe('magiduse', () => {
    it('should reduce a list based on input string with default value', () => {
        let ret = magiduse([{i: [2]}], 'acc + i of elem default list', {});
        expect(ret[0]).to.equal(2)
    });
    it('should replace aliases', () => {
        let ret = magiduse([{i: [2]}], 'sum i of elem from array', {});
        expect(ret[0]).to.equal(2)
    });
});

describe('aliases', () => {
    describe('last', () => {
        it('should return last elem', () => {
            let ret = magiduse([{bill_date: '2018-09-20'}, {bill_date: '2018-09-10'}], 'last', {});
            expect(ret.bill_date).to.equal('2018-09-20');
        })
    })
    describe('first', () => {
        it('should return first elem', () => {
            let ret = magiduse([{bill_date: '2018-09-20'}, {bill_date: '2018-09-10'}], 'first', {});
            expect(ret.bill_date).to.equal('2018-09-10');
        })
    })
    describe('sum', () => {
        it('should sum', () => {
            let ret = magiduse([{bill_date: '2018-09-20'}, {bill_date: '2018-09-10'}], 'sum date of elem from string', {});
            expect(ret).to.equal('2018-09-202018-09-10');
        })
    })
})

describe('expression', () => {
    describe('remember', () => {
        it('should remember expression or result', () => {
            let vars = expression('remember 1 as one');
            expect(vars['one']()).to.equal(1);
        })
        it('should remember result of expression', () => {
            let vars = expression('remember 1 + 1 as one');
            expect(vars['one']()).to.equal(2);
        })
        it('should remember complex functions', () => {
            let vars = expression('remember function do a + 0 . args as complex', {a: 2});
            expect(vars['complex'](2)).to.equal(4);
        })
        it('should remember overwrite', () => {
            let vars = expression('remember run a + 1 as b', {a: 2});
            expect(vars['b']).to.equal(3);
        })
    })
    describe('function', () => {
        it('should define functions', () => {
            let func = expression('function do 1 + 2');
            expect(func()).to.equal(3);
        })
        it('should return argument list', () => {
            let func = expression('function do arguments');
            expect(func(1, 2, 3).toString()).to.equal([1, 2, 3].toString());
        })
        it('should return first argument', () => {
            let func = expression('function do 0 . arguments');
            expect(func(1, 2, 3)).to.equal(1);
        })
        it('should define functions with parameters', () => {
            let func = expression('function do 0 . arguments + 1 . arguments');
            expect(func(1, 2)).to.equal(3);
        })
    })

    describe('then and also', () => {
        it('should execute multiple operations and return last element and remember vars from earlier with then', () => {
            let func = expression('remember run 1+1 as two then run two');
            expect(func).to.equal(2)
        })
        it('should execute multiple operations and return last element and remember vars from earlier with also', () => {
            let func = expression('remember 1+1 if 1 < 0 else 1+2 as two then run run two');
            expect(func).to.equal(3)
        })
        it('should execute multiple operations and return last element and remember vars from earlier', () => {
            let func = expression('remember space as output then while a > 0 do remember run a - 1 as a also remember run output + a as output also remember run output + bottles as output also remember run output + beer as output', {a: 100})();
            console.log(func)
            expect(func['a']).to.equal(0)
        })
        // it('should execute multiple operations and return last element and remember vars from earlier', () => {
        //     let func = expression('remember function do 0 . args + space + bottles + space + beer + space as count then remember run space as output then while a > 0 do remember run a - 1 as a also remember output + run count parameter a as output', {a: 100})();
        //     console.log(func)
        //     expect(func).to.equal('')
        // })
    })

    describe('while', () => {
        it('should be able to preform a simple while', () => {
            let func = expression('function do while a > 0 do remember run a - 1 as a', {a: 5});
            expect(func()['a']).to.equal(0);
        })
    })

    // describe('99 bottles of beer', () => {
    //     let func = expression('remember run 100 as bottles then remember function do bottles - 1 as bottles as lower then function do while bottles > 0 do run lower then run bottles')
    //     expect(func).to.equal(0);
    // })
})