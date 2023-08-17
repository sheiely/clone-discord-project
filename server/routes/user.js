const express = require('express');
const passport = require('passport');
const router = express.Router();
const mongoose = require('mongoose');
require("../models/User");
const User = mongoose.model('users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

    router.post("/getbyid", passport.authenticate('jwt', { session: false }), (req, res)=>{
        User.findOne({_id: req.body.friendId}).select("-password").then((user)=>{
            if(!user){
                return res.status(400).send({
                    success: false,
                    message: "User not found"
                });
            }
            return res.status(200).send({
                success: true,
                user: user
            });
        }).catch();
    });
    router.post("/register", (req, res)=>{
        
        User.findOne({$or:[{name: req.body.name},{email: req.body.email}]}).then((user)=>{     
            if(!user){
                if(req.body.password.length<6){
                    var erros = [];
                    erros.push({message: "Password too short", local: "password"});
                   
                    return res.status(400).send({
                        success: false,
                        errors: erros
                    });
                }
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });
        
                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(req.body.password, salt, function(err, hash){
                        if(!err){
                            newUser.password = hash;
                            newUser.save().then((user)=>{
                                const payload = {
                                    email: user.email,
                                    id: user._id,
                                };
                                const token = jwt.sign(payload, "6BduXb51Xs", {expiresIn: "5d"})
                                res.set('Authorization', 'Bearer ' ,token);
                                res.status(200).send({
                                    success: true,
                                    message: "User was successfully registered",
                                    user:{
                                        userId: user._id,
                                        username: user.name
                                    },
                                    token : "Bearer " +token
                                });
                            }).catch((err)=>{
                                res.status(400).send({
                                    success: false,
                                    message: "Something went wrong",
                                    error: err
                                });
                            })
                        }else{
                            res.status(400).send({
                                success: false,
                                message: "Something went wrong",
                                error: err
                            });
                        }
                    });
                });
             
            }else{
                
                var erros = [];
                if(user.name == req.body.name){
                    erros.push({message: "This username is already in use", local: "name"});
                }
                if(user.email == req.body.email){
                    erros.push({message: "This email is already in use", local: "email"});
                }
                if(req.body.password.length<6){
                    erros.push({message: "Password too short", local: "password"});
                }
                return res.status(400).send({
                    success: false,
                    errors: erros
                });
                
            }
           
        }).catch((err)=>{
            return res.status(400).send({
                success: false,
                message: "Something went wrong",
                error: err
            });
        });



        
    });
    router.post("/login", (req, res)=>{
        User.findOne({email: req.body.email}).then((user)=>{
            if(!user){
                return res.status(401).send({
                    success: false,
                    message: "Invalid login or password"
                });
            }
            bcrypt.compare(req.body.password, user.password , (err, result)=>{
                if(result==false){
                    return res.status(401).send({
                        success: false,
                        message: "Invalid login or password"
                    });
                }else{
                    const payload = {
                        email: user.email,
                        id: user._id,
                    };
                    const token = jwt.sign(payload, "6BduXb51Xs", {expiresIn: "5d"})
                    res.set('Authorization', 'Bearer ' ,token);
                    return res.status(200).send({
                        success: true,
                        message: "Logged",
                        token : "Bearer " +token
                    });
                }
            })
            

        }).catch((err)=>{
            return res.status(500).send({
                success: false,
                message: "Something went wrong",
                err: err
            });
        });
    });

module.exports = router;