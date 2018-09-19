const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schemas
const CommentSchema = require('./comment').CommentSchema;
const VoteSchema = require('./vote').VoteSchema;

const newsModel = new Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    created_at: {type: Date, required: true, default: Date.now},
    image: {type: String, required: true},
    category: {
        type: String,
        required: true,
        enum: ['news', 'sport', 'culture'],
        default: 'news',
    },
    importance: {type: Number, required: true, enum: [1,2]},
    
    vote_count: {type: Number, default: 0},
    votes: [VoteSchema],
    comments: [CommentSchema],
});
module.exports = mongoose.model('news', newsModel);
