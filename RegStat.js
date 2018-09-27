const request = require('request-promise-native');
const sha256 = require('sha256');
const parse_reduce = require('./parse_reduce');

class RegStat {
    constructor(sessionId) {
//        this.bearer = 'Bearer 323031382D30382D31332031353A31363A35362E3030373434392B30303A3030736C216A2126682D6F34356565657A40266C5E7873707038623879266C673D32387729733D626C37266A282869696F636469';
        this.url = 'http://localhost:8000';
        this.client_secret = 'dasdasewq-231eqw43-213esaqeqw';
        this.client_id = '123453-123432-123431';
        this.sessionId = sessionId;
    }

    authenticate() {
        this.bearer = 'Bearer ' + sha256(this.client_secret + this.sessionId);
        return `Before you do that, plase login here: ${this.url}/oauth/?client_id=${this.client_id}&session_id=${this.sessionId}`;
    }

    defaultWelcomeIntent() {
        return 'Hey I\'m Tony, what can I help you with?';
    }

    getCategories() {
        if (!this.bearer) {
            return this.authenticate();
        }

        return this.callApi('category')
            .then((data) => 
                `You've got these categories: ${data.category_list.map(cat => cat.name).join(', ')}`
            );
    }
    
    getLastTransaction() {
        if (!this.bearer) {
            return this.authenticate();
        }

        return this.callApi('transaction')
            .then((data) => 
                `The latest transaction you have is ${data.transaction_list[0].description}`
            );
    }

    reduceTransactions({reduce}) {
        console.log(this)
        if (!this.bearer) {
            return this.authenticate();
        }

        return this.callApi('transaction')
            .then(data =>
                parse_reduce.magiduse(data.transaction_list, reduce.stringValue, {})
            );
    }

    callApi(path) {
        return request.get({
            url: this.url + '/api/' + path,
            headers: { Authorization: this.bearer },
            json: true,
        });
    }

    rephrase() {
        return `I'm sorry but I'm not sure what that means, can you rephrase it please?`;
    }

    phraseLearned() {
        return `Thank you, I'll remember that!`;
    }

}

exports.RegStat = RegStat;