var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var { Dialogflow } = require('./dialogflow');

var { intentToAction } = require('./intentToAction');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    const id = 'UserId';
    const df = new Dialogflow();
    console.log('a user connected');
    
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });

    socket.on('chat message', function(msg){
        console.log('message: ' + msg);

        df.detectIntent(msg, id).then(intent => {
            const response = intentToAction(intent);
            if (response.then) {
                response.then(answer => socket.emit('chat message', answer));
            } else {
                socket.emit('chat message', response);
            }
        });

    });
  });
http.listen(3000, function(){
  console.log('listening on *:3000');
});