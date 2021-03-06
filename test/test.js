// Testing 
var expect = require('chai').expect
  , foo = 'bar'
  , beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

const { operator, compare, parseIf, condition, magiduse, expression, Environement } = require('../server/englang/englang');


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
        let func = expression('property . args');
        expect(func({property: 2})).to.equal(2);
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
    it('should handle strings', () => {
        let func = expression('quote hei endquote');
        expect(func()).to.equal('hei')
    })
    it('should handle strings with spaces', () => {
        let func = expression('quote hei pa deg endquote');
        expect(func()).to.equal('hei pa deg')
    })
    it('should handle strings with special words', () => {
        let func = expression('quote if function do end while + nothing undefined args endquote');
        expect(func()).to.equal('if function do end while + nothing undefined args')
    })
    it('should handle strings in if', () => {
        let func = expression('quote hei endquote if 1 else quote bye endquote');
        expect(func()).to.equal('hei')
    })
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
    it('should handle and and or', () => {
        let func = expression('1 if 1 && 1 else 2');
        expect(func()).to.equal(1);
        func = expression('1 if 1 && 0 else 2');
        expect(func()).to.equal(2);
        func = expression('1 if 0 && 0 else 2');
        expect(func()).to.equal(2);
        func = expression('1 if 0 || 0 else 2');
        expect(func()).to.equal(2);
        func = expression('1 if 1 || 1 else 2');
        expect(func()).to.equal(1);
        func = expression('1 if 1 || 0 else 2');
        expect(func()).to.equal(1);
        func = expression('1 if 0 || 1 else 2');
        expect(func()).to.equal(1);
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
    it('should handle property of on parameters', () => {
        let func = expression('total . args');
        expect(func({total: 15})).to.equal(15);
    })
    it('should handle property of vars', () => {
        let func = expression('total . obj', {obj: {total: 15}});
        expect(func()).to.equal(15);
    })
    it('should handle property of var with list', () => {
        let func = expression('total . 0 . obj', {obj: [{total: 15}]});
        expect(func()).to.equal(15);
    })
    it('should handle property of and remember functions', () => {
        let env = new Environement({obj: [{total: 15}]});
        env.getFunction('remember function do total . 0 . obj as get total')();
        let res = env.getFunction('run get total');
        expect(res).to.equal(15);
    })
    it('should run functions', () => {
        let func = expression('run print', {print:() => 'hey'});
        expect(func).to.equal('hey');
    })
    it('should run functions with arguments', () => {
        let func = expression('run printParam parameter Thomas', {printParam:(e) => 'hey ' + e});
        expect(func).to.equal('hey Thomas');
    })
    
    it('should run functions with arguments', () => {
        let func = expression('run welcome parameter Thomas parameter Carl', {welcome:(a, b) => `Welcome ${a} and ${b}`});
        expect(func).to.equal('Welcome Thomas and Carl');
    })
    it('should run functions with arguments', () => {
        let func = expression('run welcome parameter Thomas parameter Carl', {welcome:(a, b) => `Welcome ${a} and ${b}`});
        expect(func).to.equal('Welcome Thomas and Carl');
    })
    it('should run reduce on list from vars with function from vars', () => {
        let func = expression('run reduce . list parameter welcome parameter 1', {list: [1, 2, 3], welcome: (a, b) => a + b});
        expect(func).to.equal(7);
    })
    it('should be able to run multiple expression in succession', () => {
        let filter = expression('args < 0');
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

// describe('aliases', () => {
//     describe('last', () => {
//         it('should return last elem', () => {
//             let ret = magiduse([{bill_date: '2018-09-20'}, {bill_date: '2018-09-10'}], 'last', {});
//             expect(ret.bill_date).to.equal('2018-09-20');
//         })
//     })
//     describe('first', () => {
//         it('should return first elem', () => {
//             let ret = magiduse([{bill_date: '2018-09-20'}, {bill_date: '2018-09-10'}], 'first', {});
//             expect(ret.bill_date).to.equal('2018-09-10');
//         })
//     })
//     describe('sum', () => {
//         it('should sum', () => {
//             let ret = magiduse([{bill_date: '2018-09-20'}, {bill_date: '2018-09-10'}], 'sum date of elem from string', {});
//             expect(ret).to.equal('2018-09-202018-09-10');
//         })
//     })
// })

describe('expression', () => {
    describe('remember', () => {
        it('should remember expression or result', () => {
            let env = new Environement();
            env.getFunction('remember 1 as one')();
            expect(env.getVars()['one']()).to.equal(1);
        })
        it('should remember result of expression', () => {
            let env = new Environement();
            env.getFunction('remember 1 + 1 as one')();
            expect(env.getVars()['one']()).to.equal(2);
        })
        it('should remember complex functions', () => {
            let env = new Environement({a: 2});
            env.getFunction('remember function do a + 0 . args as complex')();
            expect(env.getVars()['complex'](2)).to.equal(4);
        })
        it('should remember overwrite', () => {
            let env = new Environement({a: 2});
            env.getFunction('remember run a + 1 as a')();
            expect(env.getVars()['a']).to.equal(3);
        })
        it('should remember a function that remembers', () => {
            let env = new Environement({var: 0});
            env.getFunction('remember function do remember run var + 1 as var as increase')();
            console.log(env.getVars())
            env.getFunction('run increase');
            env.getFunction('run increase');
            env.getFunction('run increase');

            expect(env.getVars()['var']).to.equal(3);
        })
        it('should run reduce with remembered function', () => {
            let env = new Environement({transactions: [{total: 100}, {total: 50}, {total: -25}]});
            env.getFunction('remember function do 0 . args + total . 1 . args as reduceSum')();
            console.log(env.getVars())
            let res = env.getFunction('run reduce . transactions parameter reduceSum parameter 0');
            expect(res).to.equal(125);
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
            let env = new Environement();
            let func = env.getFunction('run remember run 1+1 as two then run two');
            console.log(env.getVars())
            expect(func).to.equal(2)
        })
        it('should execute multiple operations and return last element and remember vars from earlier with also', () => {
            let env = new Environement();
            let func = env.getFunction('run remember run 1+1 if 1 < 0 else 1+2 as two then run two');
            console.log(env.getVars())
            expect(func).to.equal(3)
        })
        // it('should execute multiple operations and return last element and remember vars from earlier', () => {
        //     let func = expression('remember space as output then while a > 0 do remember run a - 1 as a also remember run output + a as output also remember run output + bottles as output also remember run output + beer as output', {a: 100})();
        //     console.log(func)
        //     expect(func['a']).to.equal(0)
        // })
        // it('Bottles of beer', () => {
        //     let func = expression(`
        //         remember function do 0 . args + quote  bottles of beer endquote as get string then
        //         remember function do remember a - 1 as a as countdown then
        //         while a > 0 do
        //             run countdown also 
        //             run print run get string parameter a
        //         `, {a: 100, print: console.log})();
        //     console.log(func)
        //     expect(func['a']).to.equal(0)
        // })
        // // it('should execute multiple operations and return last element and remember vars from earlier', () => {
        //     let func = expression('remember function do 0 . args + space + bottles + space + beer + space as count then remember run space as output then while a > 0 do remember run a - 1 as a also remember output + run count parameter a as output', {a: 100})();
        //     console.log(func)
        //     expect(func).to.equal('')
        // })
    })

    describe('while', () => {
        it('should be able to preform a simple while', () => {
            let env = new Environement({var: 10});
            env.getFunction('remember function do remember run var - 1 as var as increase')();
            
            console.log(env.getVars())
            env.getFunction('function do while var > 0 do run increase')();
            expect(env.getVars()['var']).to.equal(0);
        })
    })

    // describe('99 bottles of beer', () => {
    //     let func = expression('remember run 100 as bottles then remember function do bottles - 1 as bottles as lower then function do while bottles > 0 do run lower then run bottles')
    //     expect(func).to.equal(0);
    // })
})