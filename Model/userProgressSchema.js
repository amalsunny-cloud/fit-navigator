// models/Progress.js
// const mongoose = require('mongoose');

// const userProgressSchema = new mongoose.Schema({
//     fitnessGoal: { type: String, required: true },
//     progressData: { type: Object, required: true }, 
//     date: { type: String,default: Date.now() } 
// });

//  const Progress = mongoose.model('Progress', userProgressSchema);
//  module.exports = Progress;



const mongoose = require('mongoose');

const muscleBuildingSchema = new mongoose.Schema({
  chest: { type: Number, required: true },
  arms: { type: Number, required: true },
  waist: { type: Number, required: true },
});

const weightLossSchema = new mongoose.Schema({
  weight: { type: Number, required: true },
  bmi: { type: Number, required: true },
});

const enduranceSchema = new mongoose.Schema({
  exerciseType: { type: String, required: true },
  maxReps: { type: Number, required: true },
});

const userProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User

  fitnessGoal: { type: String, required: true, enum: ['Weight Loss', 'Endurance', 'Muscle Building'] },
  progressData: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true,
    validate: {
      validator: function (value) {
        if (this.fitnessGoal === 'Muscle Building') {
          return value.chest && value.arms && value.waist; // Validation logic
        }
        if (this.fitnessGoal === 'Weight Loss') {
          return value.weight && value.bmi;
        }
        if (this.fitnessGoal === 'Endurance') {
          return value.exerciseType && value.maxReps;
        }
        return false; // Invalid progressData
      },
      message: 'Progress data does not match the fitness goal requirements.',
    },
  },
  date: { type: String, default: Date.now },
});

const Progress = mongoose.model('Progress', userProgressSchema);
module.exports = Progress;
