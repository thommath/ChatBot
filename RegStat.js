const request = require('request-promise-native');
const sha256 = require('sha256');
const parse_reduce = require('./parse_reduce');
const db = require('./mongodb');

class RegStat {
    constructor(sessionId) {
//        this.bearer = 'Bearer 323031382D30382D31332031353A31363A35362E3030373434392B30303A3030736C216A2126682D6F34356565657A40266C5E7873707038623879266C673D32387729733D626C37266A282869696F636469';
        this.url = 'https://regstat.net';
        this.client_secret = process.env.REGSTAT_CLIENT_SECRET;
        this.client_id = process.env.REGSTAT_CLIENT_ID;
        this.sessionId = sessionId;
        this.vars = {};
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
        if (!this.bearer) {
            return this.authenticate();
        }

        return this.callApi('transaction')
            .then(data =>
                data.transaction_list.reduce(parse_reduce.expression(reduce.stringValue, {}))
            );
    }

    expression({expression}) {
        if (!this.bearer) {
            return this.authenticate();
        }

        let response = this.callApi('transaction')
            .then(data =>
                parse_reduce.expression(expression.stringValue, Object.assign(this.vars, {transactions: data.transaction_list}))
            );

        if (typeof(response) == 'object') {
            this.vars = Object.assign(this.vars, response);
        }
        if (typeof(response) == 'function') {
            response = response();
        }

        return response;
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

    save() {
        if (!this.bearer) {
            return this.authenticate();
        }

        return this.callApi('user')
            .then(data =>
                db.save(data.user.email, this.vars)
            ).then(() => 'Success')
            .catch((err) => err);
    }
    load() {
        if (!this.bearer) {
            return this.authenticate();
        }

        return this.callApi('user')
            .then(data =>
                db.load(data.user.email)
            ).then((res) => {this.vars = res; return 'Success'})
            .catch((err) => err);
    }
}

exports.RegStat = RegStat;