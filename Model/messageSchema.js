const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'A message must have a subject'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  sentTo: {
    type: String,
    required: true,
    enum: ['All Members', 'Users', 'Trainers'],
    default: 'All Members'
  },
  date: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better search performance
messageSchema.index({ subject: 'text', message: 'text' });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;