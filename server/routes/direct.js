const express = require('express');
const passport = require('passport');
const router = express.Router();
const mongoose = require('mongoose');
require("../models/Direct");
const Direct = mongoose.model('directs');


    router.post("/getdirects", passport.authenticate('jwt', { session: false }), (req, res)=>{
        Direct.find({user: req.user.id}).populate("friend", "-password").then((directs)=>{
            return res.status(200).send({
                success: true,
                directs: directs
            });
        }).catch((err)=>{
            return res.status(400).send({
                success: false,
                message: "Something went wrong",
                error: err
            });
        });
    });
    router.post("/getdirectfriend", passport.authenticate('jwt', { session: false }), (req, res)=>{
        Direct.find({user: req.user.id, friend: req.body.friendId}).populate("friend", "-password").then((directs)=>{
            return res.status(200).send({
                success: true,
                directs: directs
            });
        }).catch((err)=>{
            return res.status(400).send({
                success: false,
                message: "Something went wrong",
                error: err
            });
        });
    });
    

module.exports = router;