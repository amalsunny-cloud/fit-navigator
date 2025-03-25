//attendanceSchema.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer' },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  sessionDetails: { type: String },
});

 const Attendance = mongoose.model('Attendance', AttendanceSchema);
 module.exports = Attendance;