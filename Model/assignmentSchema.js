const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // unique: true // One user can only be assigned to one trainer
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  assignedDate: {
    type: Date,
    default: Date.now
  }
});

 const Assignment = mongoose.model('Assignment', assignmentSchema);
 module.exports = Assignment;