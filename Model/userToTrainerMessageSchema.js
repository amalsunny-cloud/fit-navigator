const mongoose = require("mongoose");

const userToTrainerMessageSchema = new mongoose.Schema({
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending','approved'],
    default: 'pending'
  },
  approvedAt: Date,
  seen: Boolean
});

const userToTrainerMessage = mongoose.model("userToTrainerMessage", userToTrainerMessageSchema);
module.exports = userToTrainerMessage;