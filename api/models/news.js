const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schemas
const CommentSchema = require('./comment').CommentSchema;
const VoteSchema = require('./vote').VoteSchema;
const UserSchema = require('./user').schema;

// Category
const categories = require('../_data/data').categories;

const newsModel = new Schema({
    title: {type: String, required: true},
    subtitle: {type: String, required: false},
    content: {type: String, required: true},
    created_at: {type: Date, required: true, default: Date.now},
    image: {type: String, required: true},
    category: {
        type: String,
        required: true,
        enum: categories,
    },
    importance: {type: Number, required: true, enum: [1,2]},
    
    vote_count: {type: Number, default: 0},
    votes: [VoteSchema],
    comments: [CommentSchema],

    author: {
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        email: {type: String, required: false},
        nickname: {type: String, required: false},
    },
});
module.exports = mongoose.model('news', newsModel);

