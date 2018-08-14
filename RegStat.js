const request = require('request-promise-native');

class RegStat {
    constructor() {
        this.bearer = 'Bearer 323031382D30382D31332031353A31363A35362E3030373434392B30303A3030736C216A2126682D6F34356565657A40266C5E7873707038623879266C673D32387729733D626C37266A282869696F636469';
        this.url = 'http://localhost:8000';
    }

    welcome() {
        return 'Welcome to Regstat!';
    }

    getCategories() {
        return request.get({ url: `${this.url}/api/category/`, headers: { Authorization: this.bearer }, json: true })
            .then((body) => `You've got these categories: ${body.category_list.map(cat => cat.name).join(', ')}`);
    }
    
    getLastTransaction() {
        return request.get({ url: `${this.url}/api/transaction/`, headers: { Authorization: this.bearer }, json: true })
            .then((response) => `The latest transaction you have is ${response.transaction_list[0].description}`);
    }
}

exports.RegStat = RegStat;