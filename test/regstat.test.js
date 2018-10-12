// Testing 
var expect = require('chai').expect
  , foo = 'bar'
  , beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

const { RegStat } = require('../RegStat');

describe('RegStat', () => {
    describe('expression', () => {
        it('should run expressions', () => {
            let rs = new RegStat();
            rs.bearer = 'we';
            rs.callApi = () => new Promise(res => res({}))
            
            return rs.expression({expression: {stringValue: '2+2'}})
                .then(response => {
                    expect(response).to.equal(4);
                })
        })
        it('should not run expressions without bearer', () => {
            let rs = new RegStat();
            rs.authenticate = function()  {this.bearer = 'hi'; return 'hi'};
            
            rs.expression({expression: {stringValue: '2+2'}})
            expect(rs.bearer).to.equal('hi');
            
        })
        it('should get transactions as variable', () => {
            let rs = new RegStat();
            rs.bearer = 'we';
            rs.callApi = () => new Promise(res => res({transactions: [{total: -200}]}));
            
            return rs.expression({expression: {stringValue: 'length . transactions'}})
                .then(response => {
                    expect(response).to.equal(1);
                })
        })
        it('should sum transactions', () => {
            let rs = new RegStat();
            rs.bearer = 'we';
            rs.callApi = () => new Promise(res => res({transactions: [{total: -200}, {total: 100}]}));
            
            return rs.expression({expression: {stringValue: 'remember function do 0 . args + total . 1 . args as reduceSum'}})
                .then(response => {
                    return rs.expression({expression: {stringValue: 'run reduce . transactions parameter reduceSum parameter 0'}});
                })
                .then(response => {
                    expect(response).to.equal(-100);
                }).catch(e => {console.error(e);expect(1).to.equal(0)})
        })
        it('should parse totals', () => {
            let rs = new RegStat();
            rs.bearer = 'we';
            rs.callApi = () => new Promise(res => res({transaction_list: [{total: "-200"}, {total: "100"}]}));
            
            return rs.expression({expression: {stringValue: 'remember function do 0 . args + total . 1 . args as reduceSum'}})
                .then(response => {
                    return rs.expression({expression: {stringValue: 'run reduce . transaction_list parameter reduceSum parameter 0'}});
                })
                .then(response => {
                    expect(response).to.equal(-100);
                }).catch(e => {console.error(e);expect(1).to.equal(0)})
        })
        it('should remember variables', () => {
            let rs = new RegStat();
            rs.bearer = 'we';
            rs.callApi = () => new Promise(res => res({transactions: [{total: -200}]}));
            
            return rs.expression({expression: {stringValue: 'remember run 2+2 as four'}})
                .then(response => 
                    rs.expression({expression: {stringValue: 'run four'}}))
                .then(response => {
                    expect(response).to.equal(4);
                })
        })
    })
})
