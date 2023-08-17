const express = require('express');
const passport = require('passport');
const router = express.Router();
const mongoose = require('mongoose');
require("../models/Friendship");
const Friendship = mongoose.model('friendships');
require("../models/User");
const User = mongoose.model('users');

router.post("/friends",  passport.authenticate('jwt', { session: false }), (req, res)=>{
    Friendship.find({$or: [{idGuest: req.user._id, status: "accepted"}, {idInviter: req.user._id, status: "accepted"}]}).populate('idInviter', '-password').populate('idGuest', '-password').lean().then((friendships)=>{
            
            var friends = [];
            
            friendships.forEach((c, i, a)=>{
                
                var user;
                if(c.idInviter._id.equals(req.user._id)){
                    user = c.idGuest;
                }else{
                    user = c.idInviter;
                }
               
                friends.push({
                    _id: c._id,
                    friend: user,
                });
              
            });
            return res.status(200).send({
                sucess: true,
                friends: friends,
                qnt: friendships.length
                });
    }).catch((err)=>{
        return res.status(400).send({
            sucess: false,
            message: "An error occurred while searching for friends",
            error: err
            });
    })
    
});
router.post("/invite",  passport.authenticate('jwt', { session: false }), (req, res)=>{
    Friendship.findOne({$or: [{_id: req.body.idFriendship, idGuest: req.user._id}, {_id: req.body.idFriendship, idInviter: req.user._id}]}).then((friendship)=>{
            return res.status(200).send({
                sucess: true,
                invites: friendship
                });
    }).catch((err)=>{
        return res.status(400).send({
            sucess: false,
            message: "An error occurred while searching the invitation",
            error: err
            });
    })
    
});

router.get("/invitesReceived",  passport.authenticate('jwt', { session: false }), (req, res)=>{
    Friendship.find({idGuest: req.user._id, status: "waiting"}).populate('idInviter').then((friendships)=>{
            return res.status(200).send({
                sucess: true,
                invites: friendships,
                qnt: friendships.length
                });
    }).catch((err)=>{
        return res.status(400).send({
            sucess: false,
            message: "An error occurred while searching the invitations",
            error: err
            });
    })
    
});

router.post("/inviteCreate",  passport.authenticate('jwt', { session: false }), (req, res)=>{
    User.findOne({name: req.body.nameGuest}).then((guest)=>{
        if(!guest){
            return res.status(400).send({
                sucess: false,
                message: "User not found",
                });
        }
        Friendship.findOne({$or: [{idInviter: req.user._id, idGuest: guest._id}, {idInviter: guest._id, idGuest: req.user._id}]}).then((friendship)=>{
            if(!friendship){
                const newFriendship = new Friendship({
                    idInviter: req.user._id,
                    idGuest: guest._id
                });
                newFriendship.save().then(()=>{
                    return res.status(201).send({
                        sucess: true,
                        message: "Invite was sent successfully"
                        });
                }).catch((err)=>{
                    return res.status(400).send({
                        sucess: false,
                        message: "An error occurred while is sending the invitation",
                        error: err
                        });
                });
            }else{
                return res.status(400).send({
                    sucess: false,
                    message: "This invitation has already been made"
                    });
            }
        }).catch((err)=>{
            return res.status(400).send({
                sucess: false,
                message: "An error occurred while is sending the invitation",
                error: err
                });
        })
    }).catch((err)=>{
        return res.status(400).send({
            sucess: false,
            message: "An error occurred while is sending the invitation",
            error: err
            });
    });
    
});

router.post("/inviteAccept",  passport.authenticate('jwt', { session: false }), (req, res)=>{
    Friendship.findOneAndUpdate({_id: req.body.idFriendship, idGuest: req.user._id}, {status: "accepted"}).then((friendship)=>{
        if(!friendship){
            return res.status(400).send({
                sucess: true,
                message: "The invite cannot be accepted or not found"
                });
        }else{
            return res.status(200).send({
                sucess: true,
                message: "Invite was accepted"
                });
        }
        

    }).catch((err)=>{
        return res.status(400).send({
            sucess: false,
            message: "An error occurred while is sending the invitation",
            error: err
            });
    })
    
});

router.post("/inviteDeny",  passport.authenticate('jwt', { session: false }), (req, res)=>{
    Friendship.findOneAndUpdate({_id: req.body.idFriendship, idGuest: req.user._id}, {status: "denied"}).then((friendship)=>{
        if(!friendship){
            return res.status(400).send({
                sucess: true,
                message: "The invite cannot be denied or not found"
                });
        }else{
            return res.status(200).send({
                sucess: true,
                message: "Invite was dennied"
                });
        }
        

    }).catch((err)=>{
        return res.status(400).send({
            sucess: false,
            message: "An error occurred while is sending the invitation",
            error: err
            });
    })
    
});



module.exports = router;