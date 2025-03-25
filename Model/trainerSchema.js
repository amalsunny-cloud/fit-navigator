//trainerSchema.js


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TrainerSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: {type:Number },
  specialization: {type:String, required: true },
  assignedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  attendanceRecords: [{ type: Schema.Types.ObjectId, ref: 'Attendance' }],
  workoutPlans: [{ type: Schema.Types.ObjectId, ref: 'WorkoutPlan' }],
  dietPlans: [{ type: Schema.Types.ObjectId, ref: 'DietPlan' }],
  trainingSchedules: [{ type: Schema.Types.ObjectId, ref: 'TrainingSchedule' }],
  profileImage: { type: String, default: null }
});


const Trainer = mongoose.model('Trainer', TrainerSchema);
module.exports = Trainer;