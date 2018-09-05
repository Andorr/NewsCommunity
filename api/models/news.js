const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const newsModel = new Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    created_at: {type: Date, required: true},
    image: {type: String, required: true},
    category: {
        type: String,
        required: true,
        enum: ['news', 'sport', 'culture'],
        default: 'news',
    },
    importance: {type: Number, required: true, enum: [1,2]},
});
module.exports = mongoose.model('news', newsModel);