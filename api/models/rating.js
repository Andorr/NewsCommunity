const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ratingModel = new Schema({
    rating: {type: Number, default: 0},
    news: {type: mongoose.Schema.Types.ObjectId, ref: 'News'},
    news: {type: mongoose.Schema.Types.ObjectId, ref: 'News'},
});
module.exports = mongoose.model('rating', ratingModel);