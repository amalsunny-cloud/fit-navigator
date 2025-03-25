
//paymentReminderSchema.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentReminderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  message: {type: String, required:true},
  read: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

 const PaymentReminder = mongoose.model('PaymentReminder', paymentReminderSchema);
 module.exports = PaymentReminder;