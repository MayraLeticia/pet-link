const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentType: {
    type: String,
    enum: ['message', 'post', 'comment'], 
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'dismissed', 'action_taken'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);
