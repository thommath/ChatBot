// Testing 
var expect = require('chai').expect
  , foo = 'bar'
  , beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

const { operator, something, compare, func, condition, magiduse } = require('../parse_reduce');


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
describe('something', () => {
    it('should return a property of element', () => {
        let func = something('property');
        expect(func(0, {property: 2})).to.equal(2);
    });
    it('should return a number', () => {
        let func = something('2');
        expect(func()).to.equal(2);
    });
    it('should return a variable', () => {
        let func = something('i', {i: 2});
        expect(func()).to.equal(2);
    });
    it('should return a string', () => {
        let func = something('hello');
        expect(func()).to.equal('hello');
    });
    it('should calculate an simple expression', () => {
        let func = something('i+2/2-1', {i: 2});
        expect(func()).to.equal(2);
    });
    it('should return a list', () => {
        let func = something('i+i', {i: [2]});
        expect(func().length).to.equal(2);
    })
    it('should parse and add lists', () => {
        let func = something('[i]+[i]', {i: 2});
        expect(func().length).to.equal(2);
        expect(func()[0]).to.equal(2);
    })
    it('should work with or without spaces', () => {
        let func = something('i   +i', {i: 2});
        expect(func()).to.equal(4);
    });
    it('should check for if and handle it', () => {
        let func = something('1 if 1 else 0');
        expect(func()).to.equal(1);
    })
    it('should check for serialized if and handle it', () => {
        let func = something('1 if 0 else 0 if 0 else 2');
        expect(func()).to.equal(2);
        func = something('1 if 0 else 0 if 1 else 2');
        expect(func()).to.equal(0);
    })
    it('should check for nested if and handle it', () => {
        let func = something('1 if 0 if 1 else 1 else 0 if 0 else 2');
        expect(func()).to.equal(2);
        func = something('1 if 1 if 0 else 0 else 0 if 1 else 2');
        expect(func()).to.equal(0);
        func = something('1 if 1 if 1+0 else 0 else 0 if 1 else 2');
        expect(func()).to.equal(1);
    })
});
describe('condition', () => {
    it('should return something', () => {
        let func = condition('2');
        expect(func()).to.equal(2);
    });
    it('should return result of comparison', () => {
        let func = condition('2 == 2');
        expect(func()).to.be.true;
        func = condition('2 > 2');
        expect(func()).to.be.false;
    });
    it('should return result of comparison', () => {
        let func = condition('2 == 2 and 1 < 2');
        expect(func()).to.be.true;
    });    
});
describe('func', () => {
    it('should return something', () => {
        let f = func('2');
        expect(f()).to.equal(2);
    });
    it('should return something based on condition', () => {
        let f = func('2 if 2 < 1 else 3');
        expect(f()).to.equal(3);
        f = func('2 if 2 > 1 else 3');
        expect(f()).to.equal(2);
    });
    it('should use acc as default else', () => {
        let f = func('2 if 2 < 1');
        expect(f(3)).to.equal(3);
        f = func('2 if 2 > 1');
        expect(f(3)).to.equal(2);
    })
});

describe('magiduse', () => {
    it('should reduce a list based on input string with default value', () => {
        let ret = magiduse([{i: [2]}], 'acc + i default list', {});
        expect(ret[0]).to.equal(2)
    });
    it('should replace aliases', () => {
        let ret = magiduse([{i: [2]}], 'sum i from array', {});
        expect(ret[0]).to.equal(2)
    })
})
