const mongoose = require('mongoose');


const trainerToUserMessageSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer',
        required: true
      },

    text:{
        type:String,
        required:true
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
});

const trainerToUserMessage = mongoose.model("trainerToUserMessage",trainerToUserMessageSchema)

module.exports = trainerToUserMessage;