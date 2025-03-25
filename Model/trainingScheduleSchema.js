const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TrainingScheduleSchema = new Schema({
  sessionName: {type:String},
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  username: {type:String},
  trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer' },
  date: { type: Date, default: Date.now,required:true },
  time: { type: String,required:true },
  sessionDetails: { type: String },
});


const TrainingSchedules = mongoose.model('TrainingSchedule', TrainingScheduleSchema);
module.exports = TrainingSchedules;