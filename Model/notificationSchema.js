const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['message_approved', 'other'], required: true },
    relatedEntityId: { type: mongoose.Schema.Types.ObjectId, required: false }, 
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

 const Notification = mongoose.model('Notification', notificationSchema);
 module.exports =Notification;