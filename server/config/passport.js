var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport');

const mongoose = require('mongoose');
require("../models/User");
const User = mongoose.model('users');


var opts = {usernameField: 'email'}

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "6BduXb51Xs";



passport.use(new JwtStrategy(opts, function(jwt_payload, done) {  
    User.findOne({_id: jwt_payload.id}).select('-password').then(user=>{
            return done(null, user);
    }).catch(err=>{
            return done(err, false);
    });
    
}));