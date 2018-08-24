const uuidv4 = require('uuid/v4');// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');


class Dialogflow {
    constructor() {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = './service_account.json';
        const projectId = 'regstat-111c1'; //https://dialogflow.com/docs/agents#settings
        const sessionId = 'quickstart-session-id';
        this.languageCode = 'en-US';
        
        this.sessionClient = new dialogflow.SessionsClient();
        this.intentsClient = new dialogflow.IntentsClient();
        this.formattedParent = this.intentsClient.projectAgentPath(projectId);

        // Define session path
        this.sessionPath = this.sessionClient.sessionPath(projectId, sessionId);

        this.getIntentList();
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
                const result = responses[0].queryResult;
                if (result.intent && result.intent.displayName !== 'Default Fallback Intent') {

                    if (this.unknownPhrase) {
                        const intent = this.addTrainingPhrase(this.unknownPhrase, this.getIntent(result.intent.name));
                        intent.then(console.log)
                        return 'Phrase Learned';
                    }

                    return result.intent.displayName;
                } else {
                    console.log(`  No intent matched.`);
                    this.unknownPhrase = msg;
                    return `I'm sorry but I'm not sure what that means, can you rephrase it please?`;
                }
            })
            .catch(err => {
                console.error('ERROR:', err);
            });
    }

    getIntentList() {
        // The text query request.
        const request = {
            parent: this.formattedParent,
            intentView: 'INTENT_VIEW_FULL',
        };
        
        // Send request and log result
        return this.intentsClient
            .listIntents(request)
            .then(response => {
                const result = response;
                this.intentList = response[0];
                console.log(response[0])
            })
            .catch(err => {
                console.error('ERROR:', err);
            });
    }

    getIntent(name) {
        return this.intentList.find(i => i.name === name);
    }


    addTrainingPhrase(phrase, intent) {
        const request = {
            intent: Object.assign(intent.name, { trainingPhrases: intent.trainingPhrases.concat([{name: uuidv4(), type: 'EXAMPLE', parts: [{ text: phrase }] }]) })
        };
        console.log('learned ' + phrase)
        return this.intentsClient
            .updateIntent(request);
    }

    //updateIntent(intent, )
};


exports.Dialogflow = Dialogflow;

const df = new Dialogflow();
df.getIntentList().then(console.log);
df.detectIntent('What is my last transaction?').then(() => 
    df.detectIntent('Something unknown').then(console.log))
.then(() => 
    df.detectIntent('Something unknown').then(console.log))
.then(() => 
    df.detectIntent('What is my last transaction?').then(console.log))




