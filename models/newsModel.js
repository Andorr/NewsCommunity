const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const newsModel = new Schema({
    title: {type: String},
    content: {type: String},
    created_at: {type: Date},
    image: {data: Buffer, contentType: String},
    category: {type: String},
    importance: {type: Number},
});
module.exports = mongoose.model('news', newsModel);