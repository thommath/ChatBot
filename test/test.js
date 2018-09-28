// Testing 
var expect = require('chai').expect
  , foo = 'bar'
  , beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

const { operator, expression, compare, parseIf, condition, magiduse } = require('../parse_reduce');


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
    it('should check for not and handle it', () => {
        let func = expression('1 if ! 1 else 0');
        expect(func()).to.equal(0);
    })
    it('should handle property of', () => {
        let func = expression('total . cur');
        expect(func(0, {total: 15})).to.equal(15);
    })
    it('should run functions', () => {
        let func = expression('print parameter', {print:() => 'hey'});
        expect(func()).to.equal('hey');
    })
    it('should run functions with arguments', () => {
        let func = expression('printParam parameter Thomas', {printParam:(e) => 'hey ' + e});
        expect(func()).to.equal('hey Thomas');
    })
    it('should run functions with arguments', () => {
        let func = expression('welcome parameter Thomas parameter Carl', {welcome:(a, b) => `Welcome ${a} and ${b}`});
        expect(func()).to.equal('Welcome Thomas and Carl');
    })
    it('should run functions with arguments', () => {
        let func = expression('welcome parameter Thomas parameter Carl', {welcome:(a, b) => `Welcome ${a} and ${b}`});
        expect(func()).to.equal('Welcome Thomas and Carl');
    })
    it('should run map on list from vars with function from vars', () => {
        let func = expression('reduce . list parameter welcome parameter 1', {list: [1, 2, 3], welcome: (a, b) => a + b});
        expect(func()).to.equal(7);
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
