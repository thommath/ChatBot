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

        // Save the list of intents
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
                        this.getIntent(result.intent.name)
                            .then(intents => 
                                this.addTrainingPhrase(this.unknownPhrase, intents[0]))
                            .then(intent => {
                                this.unknownPhrase = '';        
                            });
                        return { extra: 'Phrase Learned', intent: result.intent.displayName };
                    }

                    return { intent: result.intent.displayName, parameters: result.parameters.fields };
                } else {
                    console.log(`  No intent matched.`);
                    this.unknownPhrase = msg;
                    return { intent: 'Rephrase' };
                }
            });
    }

    getIntentList() {
        const request = {
            parent: this.formattedParent,
            intentView: 'INTENT_VIEW_FULL',
        };
        
        return this.intentsClient
            .listIntents(request)
            .then(response => {
                this.intentList = response[0];
            });
    }

    getIntent(name) {
        const request = {
            name,
            intentView: 'INTENT_VIEW_FULL',
        };
        
        return this.intentsClient
            .getIntent(request);
    }


    addTrainingPhrase(phrase, intent) {
        console.log(intent)
        const request = {
            intent: Object.assign(intent, { trainingPhrases: intent.trainingPhrases.concat([{name: uuidv4(), type: 'EXAMPLE', parts: [{ text: phrase }] }]) })
        };

        console.log('learned ' + phrase)

        return this.intentsClient
            .updateIntent(request);
    }

};


exports.Dialogflow = Dialogflow;

/*
const df = new Dialogflow();
df.getIntentList().then(console.log);
df.detectIntent('What is my last transaction?').then(() => 
    df.detectIntent('Something unknown').then(console.log))
.then(() => 
    df.detectIntent('Something unknown').then(console.log))
.then(() => 
    df.detectIntent('What is my last transaction?').then(console.log))
*/