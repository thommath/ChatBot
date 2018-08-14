// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');


class Dialogflow {
    constructor() {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = './service_account.json';
        const projectId = 'regstat-111c1'; //https://dialogflow.com/docs/agents#settings
        const sessionId = 'quickstart-session-id';
        this.languageCode = 'en-US';
        
        this.sessionClient = new dialogflow.SessionsClient();

        // Define session path
        this.sessionPath = this.sessionClient.sessionPath(projectId, sessionId);

    }

    detectIntent(msg) {
        return this.detectIntent(msg, this.sessionId);
    }
    detectIntent(msg, sessionId) {
        // The text query request.
        const request = {
            session: this.sessionPath,
            queryInput: {
                text: {
                    text: msg,
                    languageCode: this.languageCode,
                },
            },
        };
        
        // Send request and log result
        return this.sessionClient
            .detectIntent(request)
            .then(responses => {
                console.log('Detected intent');
                const result = responses[0].queryResult;
                console.log(`  Query: ${result.queryText}`);
                console.log(`  Response: ${result.fulfillmentText}`);
                if (result.intent) {
                    console.log(`  Intent: ${result.intent.displayName}`);
                    return result.intent.displayName;
                } else {
                    console.log(`  No intent matched.`);
                    return '';
                }
            })
            .catch(err => {
                console.error('ERROR:', err);
            });
    }
};

exports.Dialogflow = Dialogflow;

const df = new Dialogflow();
df.detectIntent('hi').then(console.log);



