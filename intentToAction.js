
exports.intentToAction = (intent, rs) => {

    switch(intent) {
        case 'Default Welcome Intent': 
            return rs.welcome();
        case 'Get Categories':
            return rs.getCategories();
        case 'Get Last Transaction':
            return rs.getLastTransaction();
        default: 
            return 'Sorry I don\'t know how to handle that';
    }
}