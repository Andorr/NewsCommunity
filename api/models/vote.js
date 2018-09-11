const mongoose = require('mongoose');
const Schema = mongoose.Schema;
exports.VoteSchema = new Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    created_at: {type: Date, default: Date.now},
});