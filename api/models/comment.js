const mongoose = require('mongoose');
const Schema = mongoose.Schema;
exports.CommentSchema = new Schema({
    comment: {type: String, required: true, default: ''},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    user_nickname: {type: String, default: 'Unknown'},
    created_at: {type: Date, default: Date.now},
});