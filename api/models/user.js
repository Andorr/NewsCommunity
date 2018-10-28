const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userModel = new Schema({
    email: {
        type: String,
        required: true,
        index: true,
        unique: true,
        sparse: true,
        trim: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {type: String, required: true, select: false},
    nickname: {type: String},
});

module.exports = mongoose.model('user', userModel);