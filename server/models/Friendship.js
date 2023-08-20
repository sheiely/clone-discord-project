const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const FriendShip = Schema({
    idInviter: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    idGuest: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: String,
        default: "waiting"
    }
    
});

mongoose.model('friendships', FriendShip);