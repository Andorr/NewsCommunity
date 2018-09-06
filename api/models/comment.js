const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const commentModel = new Schema({
    comment: {type: String, required: true, default: ''},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    user_nickname: {type: String, default: 'Unknown'},
    created_at: {type: Date, default: Date.now},
});
module.exports = mongoose.model('comment', commentModel);