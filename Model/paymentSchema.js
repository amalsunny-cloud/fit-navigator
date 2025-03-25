const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  
  userId: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true},
  planId: {type: mongoose.Schema.Types.ObjectId,ref: 'Plan',required: true},
  amount: {type: Number,required: true},
  status: {type: String,enum: ['pending', 'paid', 'failed'],default: 'pending'},
  paymentDate: {type: Date,default: Date.now},
  transactionId: {type: String,unique: true,sparse: true},
  updatedAt: { type: Date, default: Date.now },
  planDetails: {
    name: String,
    duration: Number,
    price: Number,
    startDate: Date,
    expirationDate: Date
  }


});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
