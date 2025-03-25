const mongoose = require('mongoose');
//for creating plans for admin
const planSchema = new mongoose.Schema({

  name: {type: String,required: [true, 'Plan name is required'],unique: true,trim: true},
  duration: {type: Number,required: [true, 'Duration in months is required'],min: [1, 'Duration must be at least 1 month']},
  price: {type: Number,required: [true, 'Price is required'],min: [0, 'Price cannot be negative']},
  status: {type: String,enum: ['active', 'inactive'],default: 'active'},
  createdAt: {type: Date,default: Date.now}

});

const Plan = mongoose.model('Plan', planSchema);
module.exports = Plan;