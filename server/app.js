const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"//CHANGE TO DEPLOY
    }
});
const mongoose = require('mongoose');
require("./models/Message");
const Message = mongoose.model('messages');
const passport = require('passport');
require("./config/passport");
const message = require('./routes/message');
const friendship = require('./routes/friendship');
const user = require('./routes/user');
const PORT = process.env.PORT || 8081;
const cors = require('cors'); 
const functionsJwt = require("./config/jwt");
const CryptoJS = require("crypto-js");
const cryptoKey = "k5MSgmVaEI";
require("./models/Friendship");
const Friendship = mongoose.model('friendships');
const pass = "CkkCMgKGYHu7bBPA";
const mongoToDeploy = 'mongodb+srv://user:CkkCMgKGYHu7bBPA@cluster0.aokjon4.mongodb.net/?retryWrites=true&w=majority';
//configs
    //BodyParser
        app.use(bodyParser.urlencoded({extended:true}));
        app.use(bodyParser.json());
    //Mongoose
        console.log('Trying connect with mongoAtlas');
        mongoose.connect("mongodb+srv://user:CkkCMgKGYHu7bBPA@cluster0.aokjon4.mongodb.net/?retryWrites=true&w=majority").then(() => {///REMEMBER CHANGE FOR DEPLOY
            console.log('Connected with MongoDB');
        }).catch((err) => {
            console.log('An erro occurred when tryng to connect with MongoDB: '+err);
        });
    //Passport
        app.use(passport.initialize());
    //Cors
        app.use(cors({
            origin: "*"//CHANGE TO DEPLOY
        }));
//routers

    app.use('/message', message);
    app.use('/friendship', friendship);
    app.use('/user', user);
    app.get("/", (req, res)=>{
        res.send("ta funcionando");
    });

//variables for socket
    var usersConnected = [];
//Socket
    const wrapMiddlewareForSocketIo = middleware => (socket, next) => middleware(socket.request, {}, next);
    io.use(wrapMiddlewareForSocketIo(passport.initialize()));
    io.use(wrapMiddlewareForSocketIo(passport.authenticate('jwt', {session: false})));
    io.on("connection", async (socket) => {
        socket.on('add user', (token)=>{    
            const user = functionsJwt.parse(token);
            socket.username = user.name;
            socket.sessionID = user.id;
            socket.join(user.id);
            usersConnected.push(user);
            Friendship.find({$or: [{idGuest: user.id, status: "accepted"}, {idInviter: user.id, status: "accepted"}]}).lean().then((friendships)=>{
                for(var i=0; i<friendships.length; i++){
                    var index = usersConnected.findIndex(obj =>{
                        if(friendships[i].idInviter == socket.sessionID){
                            return obj.id == friendships[i].idGuest;
                        }else{
                           return obj.id == friendships[i].idInviter;
                        }
                    });
                    if(index != -1){
                        io.to(usersConnected[index].id).emit('friend connected', socket.sessionID);
                    }
                }
            }).catch();
        });
        socket.on('disconnect', () => {
            if(typeof socket.sessionID !== "undefined"){
                var index = usersConnected.findIndex(obj =>{
                    return obj.id == socket.sessionID;
                });
                usersConnected.splice(index, 1);
                setTimeout(()=>{
                    var index2 = usersConnected.findIndex(obj =>{
                        return obj.id == socket.sessionID;
                    });
                    if(index2 == -1){
                        Friendship.find({$or: [{idGuest: socket.sessionID, status: "accepted"}, {idInviter: socket.sessionID, status: "accepted"}]}).lean().then((friendships)=>{
                            for(var i=0; i<friendships.length; i++){
                                var index3 = usersConnected.findIndex(obj =>{
                                    if(friendships[i].idInviter == socket.sessionID){
                                        return obj.id == friendships[i].idGuest;
                                    }else{
                                        return obj.id == friendships[i].idInviter;
                                    }
                                });
                                if(index3 != -1){
                                    io.to(usersConnected[index3].id).emit('friend disconnected', socket.sessionID);
                                }
                            }
                        }).catch((err)=>{
                            console.log(err);
                        });
                    }
                },5000);
            }
        });
        socket.on('private message', (idDestine, msg)=>{
       
            var msgEncrypted = CryptoJS.AES.encrypt(msg, cryptoKey).toString();
            const newMessage = {
                from: socket.sessionID,
                to: idDestine,
                msg: msgEncrypted,
                date: Date.now()
            };
            new Message(newMessage).save().then((message)=>{
                message.populate('from', '-password').then(()=>{
                    var bytes  = CryptoJS.AES.decrypt(message.msg, cryptoKey);
                    var decrypt = bytes.toString(CryptoJS.enc.Utf8);
                    message.msg = decrypt;
                   

                    io.to(idDestine).emit('notification', socket.sessionID);
                    var msgTrated = {
                        message: message,
                        username: socket.username,
                        from: socket.sessionID,
                        to: idDestine
                    }
                    io.to(socket.sessionID).to(idDestine).emit('private message', msgTrated);
                });
                
            }).catch((err)=>{
                console.log("an error occurred while sending message");
                console.log(err);
            });
            
        });
        socket.on('online friends', ()=>{
            Friendship.find({$or: [{idGuest: socket.sessionID, status: "accepted"}, {idInviter: socket.sessionID, status: "accepted"}]}).lean().then((friendships)=>{
                var friendsConnected = [];
                for(var i=0; i<friendships.length; i++){
                    var index = usersConnected.findIndex(obj =>{
                        if(friendships[i].idInviter == socket.sessionID){
                            return obj.id == friendships[i].idGuest;
                        }else{
                           return obj.id == friendships[i].idInviter;
                        }
                    });
                    if(index != -1){
                        friendsConnected.push(usersConnected[index]);
                    }
                    
                }

                io.to(socket.sessionID).emit('online friends', friendsConnected);
            }).catch();
        });
        
        //app notifics
        socket.on('invitation made', (idInvite)=>{
         
            Friendship.findOne({'_id': idInvite}).populate('idGuest', '-password').lean().then((invite)=>{
                io.to(invite.idGuest._id.toString()).emit('invitation made', invite);
            }).catch((err)=>{
                console.log(err);
            });
            
        });
        socket.on('invitation accept', (idInvite)=>{
            Friendship.findOne({'_id': idInvite}).populate('idGuest', '-password').lean().then((invite)=>{
                io.to(invite.idInviter.toString()).emit('invitation accept', invite);
            }).catch((err)=>{
                console.log(err);
            });
        });
        socket.on('message visualize', (friendId)=>{
            Message.findOneAndUpdate({from: friendId}, {status: 'read'}).then(()=>{
                   
            }).catch((err)=>{
                    console.log(err);
            });
        });
        
    });


server.listen(PORT, function(){
    console.log('Server in port '+PORT);
});

