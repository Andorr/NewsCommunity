const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const voteModel = new Schema({
    vote: {type: Number, min: 0, max: 5, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    created_at: {type: Date, default: Date.now},
});
module.exports = mongoose.model('vote', voteModel);