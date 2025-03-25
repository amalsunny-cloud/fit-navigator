const mongoose = require('mongoose');
const AttendanceAdmin = require('../Model/attendanceSchema')
const Attendance = require('../Model/attendanceSchema');


  // Get attendance records
  exports.getAttendance =  async (req, res) => {
    try {
      console.log("--------------------");

      const { date, trainerId } = req.query;
      console.log("date and trainerId are:",date,trainerId);
      
      let query = {};
      
      if (date) {
        // Create date range for the specific day
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        query.date = { $gte: startDate, $lte: endDate };
      }
      
      if (trainerId) {
        query.trainerId = trainerId;
      }

      console.log("before response of getAttendance");
      
      const records = await AttendanceAdmin.find(query)
        .populate('trainerId', 'username specialization')
        .sort({ date: -1 });

      res.json(records);
      console.log(records);
      console.log("after response of getAttendance");
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ message: 'Error fetching attendance records' });
    }
  },


  // Mark attendance
  exports.markAttendance = async (req, res) => {
    try {
      const { trainerId, date, status } = req.body;
      console.log("markAttendance details are:",trainerId, date, status );
      console.log("before checking database of markAttendance");
      
      // Check if attendance already exists for this trainer on this date
      const existingAttendance = await AttendanceAdmin.findOne({
        trainerId,
        date: {
          $gte: new Date(date).setHours(0, 0, 0, 0),
          $lte: new Date(date).setHours(23, 59, 59, 999)
        }
      });
      console.log("checking before existing user of markAttendance");
      console.log(existingAttendance);

      if (existingAttendance) {
        // Update existing attendance
        existingAttendance.status = status;
        console.log("before if saving existingUser");
        await existingAttendance.save();
        return res.json(existingAttendance); 
      }

      
      // Create new attendance record
      const attendance = new AttendanceAdmin({
        trainerId,
        date,
        status 
      });

      await attendance.save();
      res.status(201).json(attendance);
      console.log("saved attendance..mark attendace");  
    } catch (error) {
      console.error('Error marking attendance:', error);
      res.status(500).json({ message: 'Error marking attendance' });
    }
  },

  // Update attendance
  exports.updateAttendance = async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      
      const { status,date } = req.body;
      console.log(status,date);
      
      // Validate the ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid attendance ID' });
    }

    console.log("before accessing database of updateAttendance");
    const attendance = await AttendanceAdmin.findById(id);

      console.log(attendance);
      
      if (!attendance) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }
      attendance.status = status;
      await attendance.save();

      console.log("after saving in update attendance.");
      console.log(attendance);
      res.json(attendance);

    } catch (error) {
      console.error('Error updating attendance:', error);
      res.status(500).json({ message: 'Error updating attendance' });
    }
  },

  // Get attendance statistics
  exports.getAttendanceStats = async(req, res) => {
    try {
      const { trainerId, startDate, endDate } = req.query;
      console.log("getAttendanceStats, the details are:",trainerId, startDate, endDate);
      
      const query = {
        trainerId: mongoose.Types.ObjectId(trainerId),
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      console.log("before the database access, getAttendanceStats");
      const stats = await AttendanceAdmin.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      res.json(stats);
      console.log("last line of try block.success");
      
    } catch (error) {
      console.error('Error getting attendance stats:', error);
      res.status(500).json({ message: 'Error fetching attendance statistics' });
    }
  }


  exports.getAllDayTrainersAttendance = async(req,res)=>{
    try{
      console.log("inside the getAllDayTrainersAttendance function");
      const trainersAttendance = await Attendance.find({userId: {$exists: false}}).populate('trainerId','username');
  
      console.log("After the usertrainersAttendance",trainersAttendance);
  
      res.status(200).json(trainersAttendance);
    }catch(error){
      console.error("Error fetching trainers:",error);
      res.status(500).json({error:"Server error while fetching trainers."})
    }
  };

