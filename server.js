const mongo = require('mongodb').MongoClient;
const io = require('socket.io')(4000);
const client = io.sockets;

mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
    if(err){
        throw err;
    }

    console.log('MongoDB connected...');

    client.on('connection', function(socket){
        let chat = db.collection('chats');

        const sendStatus = function(s){
            socket.emit('status', s);
        }

        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }

            socket.emit('output', res);
        });

        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;

            if(name == '' || message == ''){
                sendStatus('Please enter a name and message');
            } else {
                chat.insert({name: name, message: message}, function(){
                    socket.emit('output', [data]); 

                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        socket.on('clear', function(data){
            chat.remove({}, function(){
                socket.emit('cleared');
            });
        });
    });
});
