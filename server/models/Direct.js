const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Direct = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    friend: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
});

mongoose.model('directs', Direct);