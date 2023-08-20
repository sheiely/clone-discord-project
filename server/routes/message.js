const express = require('express');
const passport = require('passport');
const router = express.Router();
const mongoose = require('mongoose');
require("../models/Message");
const Message = mongoose.model('messages');
const CryptoJS = require("crypto-js");
const cryptoKey = "k5MSgmVaEI";



    router.post("/", passport.authenticate('jwt', { session: false }), (req, res)=>{
        Message.find({$or: [{_id: req.body.idMessage, from: req.user._id}, {_id: req.body.idMessage, to: req.user._id}]}).populate('from', '-password').populate('to', '-password').sort({date: 'asc'}).lean().then((message)=>{
            if(message.length == 0){
                return res.status(400).send({
                    sucess: false,
                    message: "This message doesn't exist or you don't can acess",
                });
            }else{
                
                
                var bytes  = CryptoJS.AES.decrypt(message[0].msg, cryptoKey);
                var decrypt = bytes.toString(CryptoJS.enc.Utf8);
                message[0].msg = decrypt;
                
                return res.status(200).send({
                    sucess: true,
                    message: message
                });
            } 
        }).catch((err)=>{
            return res.status(400).send({
                sucess: false,
                message: "Something went wrong",
                error: err
            });
        })
        
    });

    router.post("/messages", passport.authenticate('jwt', { session: false }), (req, res)=>{
        
        Message.find({$or: [{from: req.user._id, to: req.body.friendId}, {from: req.body.friendId, to: req.user._id}]}).populate('from', '-password').populate('to', '-password').sort({date: 'desc'}).skip(req.body.countMessages).limit(30).lean().then((message)=>{ 
                for(var i =0; i < message.length; i++){
                    var bytes  = CryptoJS.AES.decrypt(message[i].msg, cryptoKey);
                    var decrypt = bytes.toString(CryptoJS.enc.Utf8);
                    message[i].msg = decrypt;
                }
                Message.updateMany({from: req.body.friendId, to: req.user._id, status:'unread'}, {status: 'read'}).then(()=>{
                    return res.status(200).send({
                        sucess: true,
                        message: message,
                        countMessagesSendByServer: message.length,
                        friendId: req.body.friendId
                    });
                }).catch((err)=>{
                    console.log(err);
                });
        }).catch((err)=>{
            return res.status(400).send({
                sucess: false,
                message: "Something went wrong",
                error: err
            });
        })
        
    });
    router.post("/messagesUnread", passport.authenticate('jwt', { session: false }), (req, res)=>{
        Message.find({from: req.body.friendId, to: req.user._id, status:'unread'}).populate('from', '-password').populate('to', '-password').sort({date: 'asc'}).lean().then((message)=>{
            
            return res.status(200).send({
                sucess: true,
                message: message
            });
        }).catch((err)=>{
            return res.status(400).send({
                sucess: false,
                message: "Something went wrong",
                error: err
            });
        })
        
    });
    

module.exports = router;