const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Message = Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: String,
        default: "unread"
    }
});

mongoose.model('messages', Message);