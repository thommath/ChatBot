var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var shortId = require('shortid');

var { Dialogflow } = require('./components/dialogflow');
const { RegStat } = require('./components/RegStat');

var { intentToAction } = require('./intentToAction');


// Session handling
var session = require("express-session")({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");
 
// Use express-session middleware for express
app.use(session);
 
// Use shared session middleware for socket.io
// setting autoSave:true
io.use(sharedsession(session, {
    autoSave:true
})); 
// Session handeling done


app.get('/', function(req, res){
  res.sendFile(__dirname + '/html/index.html');
});

io.on('connection', function(socket){
    const id = shortId.generate();
    const df = new Dialogflow();
    console.log('a user connected');
    const rs = new RegStat(id);
    
    socket.emit('chat message', 'Hi');
    
    
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });

    socket.on('chat message', function(msg){
        console.log('message: ' + msg);

        df.detectIntent(msg, id).then(obj => {
            const { intent, extra, parameters } = obj;

            if (extra) {
                const response = intentToAction(extra, rs, parameters);
                
                if (response.then) {
                    response.then(answer => socket.emit('chat message', answer));
                } else {
                    socket.emit('chat message', response);
                }
            }

            if (intent) {
                const response = intentToAction(intent, rs, parameters);
                
                if (response.then) {
                    response.then(answer => socket.emit('chat message', answer));
                } else {
                    socket.emit('chat message', response);
                }
            }
        });
    });
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});