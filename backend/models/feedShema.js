const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  });

const FeedSchema = new mongoose.Schema({
    description:{type: String, require: false},
    comments:[commentSchema],
    feedImg:{type: String},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    petId : {type: mongoose.Schema.Types.ObjectId, ref: "Feed", required: false}
})
module.exports = mongoose.model('Feed', FeedSchema);    