const bcrypt = require('bcrypt');
const Trainer = require("../Model/trainerSchema");
const jwt = require("jsonwebtoken");
const TrainingSchedules = require("../Model/trainingScheduleSchema");
const Attendance = require("../Model/attendanceSchema");
const User = require("../Model/userSchema");
const assignWorkout = require("../Model/assignWorkoutSchema");
const Assignment = require("../Model/assignmentSchema");
const mongoose = require("mongoose");
const assignDietPlan = require("../Model/assignDietPlanSchema");
const Progress = require("../Model/userProgressSchema");
const userToTrainerMessage = require("../Model/userToTrainerMessageSchema");
const Notification = require("../Model/notificationSchema");
const Message = require('../Model/messageSchema');


// Middleware to verify admin token
exports.verifyAdmin = async (req, res, next) => {
  try {
    console.log("before token");

    const token = req.headers.authorization?.split(" ")[1];
    console.log(token);

    if (!token) {
      return res.status(401).json({ message: "Admin token required" });
    }
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    if (!decoded.adminId) {
      return res.status(401).json({ message: "Not authorized as admin" });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid admin token" });
  }
};

exports.trainerregister = async (req, res) => {
  console.log("Inside the trainer register function in 43");

  try {
    const { username, email, password, phone, specialization } = req.body;

    // Check if trainer already exists
    const existingTrainer = await Trainer.findOne({ email });
    if (existingTrainer) {
      return res
        .status(400)
        .json({ message: "Trainer already exists with this email" });
    }

    // Create new trainer
    const newTrainer = new Trainer({
      username,
      email,
      password,
      phone,
      specialization,
    });

    // Save trainer
    await newTrainer.save();
    res.status(201).json({
      message: "Trainer registered successfully",
      trainer: newTrainer,
    });
  } catch (error) {
    console.log("Error in trainer registration:", error);
    res.status(500).json({
      message: "Failed to register trainer",
      error: error.message,
    });
  }
};

exports.trainerlogin = async (req, res) => {
  console.log("Inside the trainer login function in 81");
  const { email, password } = req.body;
  console.log("email is:",email);
  console.log("password is:",password);
  
    try {
      console.log("inside try block");
      if (!email || !password) {
        return res.status(400).json("Email and password are required");
      }
  
      
      // Find trainer by email
      const existingTrainer = await Trainer.findOne({ email });
      console.log("existingTrainer in 93:",existingTrainer);
      
      if (!existingTrainer) {
        return res.status(404).json("Trainer not found");
      }
  
      console.log("Stored hash:", existingTrainer.password);
      // Compare passwords
      const isMatch = await bcrypt.compare(password, existingTrainer.password);
      console.log("After isMatch in 101 trainerLogin:",isMatch);
      
      if (!isMatch) {
        return res.status(401).json("Invalid credentials");
      }
  
      // Generate JWT token
      const GeneratedToken = jwt.sign(
        { trainerId: existingTrainer._id },
        process.env.JWT_SECRET,
      );

      console.log("token of trainerLogin section:",GeneratedToken);
      
  
      res.status(200).json({
        message: "Login successful",
        GeneratedToken,
        existingTrainer: {
          _id: existingTrainer._id,
          username: existingTrainer.username,
          email: existingTrainer.email,
          specialization: existingTrainer.specialization
        }
      });

  } catch (err) {
    console.log("not authorised");

    res.status(401).json(err);
  }
};


exports.fetchTrainerData = async (req, res) => {
  const trainerId = req.params.id;
  console.log("params:", req.params);
  console.log("trainerId:", trainerId);

  // Validate the ObjectId format
  if (!mongoose.Types.ObjectId.isValid(trainerId)) {
    return res.status(400).json({ message: "Invalid trainer ID format" });
  }

  try {
    console.log("Inside the fetchTrainerData backend");
    const objectId = new mongoose.Types.ObjectId(trainerId);
    console.log("objectId fetchTrainerData backend:", objectId);

    const fetchedTrainer = await Trainer.findById({ _id: objectId });

    if (!fetchedTrainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    console.log("Fetched trainer:", fetchedTrainer);
    res.status(200).json(fetchedTrainer);
  } catch (error) {
    console.error("Error at backend fetchTrainerData");
    res.status(500).json(error);
  }
};

exports.addtrainerSchedules = async (req, res) => {
  console.log("inside the trainer schedules function");

  try {
    const { userId, sessionName, date, time, trainerId, username } = req.body;

    // Check if all necessary fields are provided
    if (!userId || !sessionName || !date || !time || !trainerId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    console.log(
      "Data in trainerSchedule:",
      userId,
      trainerId,
      sessionName,
      date,
      time
    );

    const existingSchedule = await TrainingSchedules.findOne({
      userId,
      sessionName,
      date,
    });

    if (existingSchedule) {
      res.status(400).json("already exists the schedules");
    }

    const newtrainingSchedule = new TrainingSchedules({
      userId,
      trainerId,
      sessionName,
      date,
      time,
    });

    await newtrainingSchedule.save();
    // Populate the userId field before sending response
    const populatedSchedule = await TrainingSchedules.findById(
      newtrainingSchedule._id
    ).populate("userId", "username"); // Populate userId and get username field

    return res.status(201).json(populatedSchedule);

  } catch (error) {
    console.log("Error in trainer registration:", error);
    res.status(500).json("Failed to register trainer", error);
  }
};

exports.gettrainerSchedules = async (req, res) => {
  console.log("inside get trainer scheduler function");

  try {
    const response = await TrainingSchedules.find().populate(
      "userId",
      "username"
    );
    console.log("after the response", response);
    return res.status(200).json(response);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch schedules", error: err });

    console.error("error", err);
  }
};

exports.updateTrainerSchedules = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, sessionName, date, time, trainerId } = req.body;

    // Validate input
    if (!userId || !sessionName || !date || !time || !trainerId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find and update the schedule
    const updatedSchedule = await TrainingSchedules.findByIdAndUpdate(
      id,
      {
        userId,
        sessionName,
        date: new Date(date),
        time,
        trainerId,
      },
      { new: true, runValidators: true }
    ).populate("userId", "username"); // Populate user data

    if (!updatedSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.status(200).json({
      ...updatedSchedule._doc,
      userId: {
        _id: updatedSchedule.userId._id,
        username: updatedSchedule.userId.username,
      },
    });
  } catch (error) {
    console.error("Error updating trainer schedule:", error);
    res
      .status(500)
      .json({ message: "Failed to update schedule", error: error.message });
  }
};

exports.deleteTrainerSchedules = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the schedule
    const deletedSchedule = await TrainingSchedules.findByIdAndDelete(id);

    if (!deletedSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.status(200).json({
      message: "Schedule deleted successfully",
      deletedSchedule,
    });
  } catch (error) {
    console.error("Error deleting trainer schedule:", error);
    res.status(500).json({
      message: "Failed to delete schedule",
      error: error.message,
    });
  }
};

exports.markUserAttendances = async (req, res) => {
  try {
    const { userId, trainerId, status } = req.body;
    console.log(
      "details of markUserAttendances are:",
      userId,
      trainerId,
      status
    );

    // Validate input
    if (!userId || !trainerId || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create new attendance record
    console.log("before new attendance");

    if (req.body.status !== "Present" && req.body.status !== "Absent") {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const today = new Date().toISOString().split("T")[0];

    // Check if attendance is already marked for today
    const existingAttendance = await Attendance.findOne({
      userId,
      trainerId,
      date: today,
    });

    if (existingAttendance) {
      return res
        .status(400)
        .json({ message: "Attendance already marked for today" });
    }

    const newAttendance = new Attendance({
      userId,
      trainerId,
      status,
      date: today,
    });

    await newAttendance.save();

    console.log("Attendance saved of user successfully");

    res.status(201).json({
      message: "Attendance marked successfully",
      data: newAttendance,
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({
      message: "Failed to mark attendance",
      error: error.message,
    });
  }
};

exports.updateUserAttendances = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(status);

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    console.log("before updateAttendace variable");
    console.log(Attendance);

    console.log("before updatedAttendance variable");

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("userId", "username")
      .populate("trainerId", "username");

    console.log("after updatedAttendance variable");

    console.log(updatedAttendance);

    if (!updatedAttendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.status(200).json({
      message: "Attendance updated successfully",
      data: updatedAttendance,
    });
    console.log("suuccessful updateAttendace variable");
  } catch (error) {
    res.status(500).json({
      message: "Failed to update attendance",
      error: error.message,
    });
  }
};

exports.deleteUserAttendances = async (req, res) => {
  try {
    console.log("inside try block of deleteUserAttendances");

    const { id } = req.params;
    console.log(id);

    const deletedAttendance = await Attendance.findByIdAndDelete(id);
    console.log("the value is ", deletedAttendance);

    if (!deletedAttendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.status(200).json({
      message: "Attendance record deleted successfully",
      data: deletedAttendance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete attendance",
      error: error.message,
    });
  }
};

exports.getAllUserAttendances = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({
      userId: { $exists: true },
    })
      .populate("userId", "username")
      .populate("trainerId", "username")
      .sort({ date: -1 });

    res.status(200).json({
      message: "Attendance records retrieved successfully",
      data: attendanceRecords,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve attendance records",
      error: error.message,
    });
  }
};

exports.getTrainersAllUserAttendances = async (req, res) => {
  try {
    console.log("Inside the getTrainerAllUserAttendances");
    const trainerID = req.params.id;
    console.log("trainerId in getTrainerAllUserAttendances:", trainerID);

    const convertedTrainerId = new mongoose.Types.ObjectId(trainerID);
    console.log("converted trainerId in getTrainerAllUserAttendances:",convertedTrainerId);

    const attendanceRecords = await Attendance.find({
      userId: { $exists: true },
      trainerId: convertedTrainerId,
    })
      .populate("userId", "username")
      .populate("trainerId", "username")
      .sort({ date: -1 });

    console.log("Attendance Records in 446 *:", attendanceRecords);

    res.status(200).json({
      message: "Attendance records retrieved successfully",
      data: attendanceRecords,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve attendance records",
      error: error.message,
    });
  }
};

// For fetching only today's attendance
exports.getTodayUserAttendances = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAttendance = await Attendance.find({
      userId: { $exists: true },
      trainerId: trainerId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate("userId", "username")
      .populate("trainerId", "username")
      .sort({ date: -1 });

    res.status(200).json({
      message: "Today's attendance records retrieved successfully",
      data: todayAttendance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve today's attendance records",
      error: error.message,
    });
  }
};

// Update trainer profile image
exports.updateTrainerProfileImage = async (req, res) => {
  try {
    const { id: trainerId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`; // Path to the uploaded file

    const updatedTrainer = await Trainer.findByIdAndUpdate(
      trainerId,
      { profileImage: imageUrl },
      { new: true, runValidators: true }
    );

    if (!updatedTrainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    res.status(200).json({
      message: "Profile image updated successfully",
      profileImage: updatedTrainer.profileImage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update profile image",
      error: error.message,
    });
  }
};

// Get trainer profile details
exports.getTrainerProfile = async (req, res) => {
  try {
    const trainerId = req.params.id || req.body.trainerId;

    // Find the trainer by ID
    const trainer = await Trainer.findById(trainerId);
    console.log("trainer at backenddd:", trainer);

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Return the trainer's details
    res.status(200).json({
      username: trainer.username,
      specialization: trainer.specialization,
      profileImage: trainer.profileImage, // Send the current profile image URL
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Failed to fetch trainer profile",
        error: error.message,
      });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

exports.assignWorkouts = async (req, res) => {
  try {
    console.log("Inside the assignWorkouts funtions");

    const { planname, instructions, userId } = req.body;

    console.log("datas from the reqBody are", planname, instructions, userId);

    if (!planname || !instructions || !userId) {
      console.log("Fill all required fields");
    }

    console.log("id at assignWorkouts:", userId);

    const ExistingWorkoutPlan = await assignWorkout.findOne({ userId: userId });
    console.log("ExistingWorkoutPlan:", ExistingWorkoutPlan);

    if (ExistingWorkoutPlan) {
      console.log("Workout plan already exists");
      return res.status(406).json("Already exists the Workout plan...");
    }

    const formattedUserId = new mongoose.Types.ObjectId(userId);
    console.log("formattedUserId", formattedUserId);

    // Check if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid userId provided");
      return res.status(400).json({ message: "Invalid userId" });
    }

    // Optional: Verify if user exists in the database
    const userExists = await User.findById(userId);
    if (!userExists) {
      console.error("User does not exist");
      return res.status(404).json({ message: "User not found" });
    }

    const saveassignWorkout = new assignWorkout({
      planname,
      instructions,
      userId,
      date: Date.now(),
    });

    await saveassignWorkout.save();
    console.log("Saved the saveAssignWorkout");
    res
      .status(200)
      .json({
        message: "Successfully saved Assign Workout",
        saveassignWorkout,
      });
  } catch (error) {
    console.error("error at posting assign workouts", error);
    res.status(500).json({ message: "error at controller Assign Workout" });
  }
};

exports.fetchAllUsers = async (req, res) => {
  const trainerId = req.params.id || req.query.trainerId;
  console.log("trainerId in the backend is:", trainerId);

  try {
    console.log("inside the fetchAllUsers backend function");

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({ message: "Invalid trainerId" });
    }

    const assignedUsers = await Assignment.find({
      trainer: new mongoose.Types.ObjectId(trainerId),
    }).populate("user");

    if (assignedUsers.length === 0) {
      console.log("No assigned users found for trainerId:", trainerId);
    }

    console.log("Results are:::", assignedUsers);
    res.status(200).json({
      data: assignedUsers,
      message: "fetched all users successfully",
    });
  } catch (error) {
    console.error("error at backend fetchAllUsers");
    res
      .status(500)
      .json({ message: "error at getting users", error: error.message });
  }
};

exports.getWorkouts = async (req, res) => {
  try {
    console.log("Inside the getWorkouts function");

    const workoutPlans = await assignWorkout
      .find()
      .populate("userId", "username");
    console.log(workoutPlans);
    res
      .status(200)
      .json({ message: "successfully got the assign workouts", workoutPlans });
  } catch (error) {
    console.error("Error at fetching assign workouts");
    res.status(500).json({ message: "error at the assign workouts", error });
  }
};

exports.updateAssignWorkoutPlan = async (req, res) => {
  try {
    console.log("Inside the updateAssignWorkoutPlan function");
    const workoutPlanId = req.params.id;

    const { planname, instructions, userId } = req.body;
    console.log("details are:", planname, instructions, userId, workoutPlanId);

    console.log("userId at controller:", userId);

    const response = await assignWorkout.findByIdAndUpdate(
      workoutPlanId,
      { planname, instructions, userId },
      { new: true, runValidators: true }
    );
    if (!response) {
      return res.status(404).json({ message: "response not found" });
    }

    res.status(200).json({
      message: "Workout plan updated successfully",
      updatedPlan: response,
    });
  } catch (error) {
    console.error("Error at catch block of updateAssignWorkoutPlan", error);
    res.status(500).json({
      message: "Failed to update profile image",
      error: error.message,
    });
  }
};

exports.deleteAssignWorkout = async (req, res) => {
  try {
    console.log("Inside the backend deleteAssignWorkout function");

    const { id } = req.params;
    console.log("Deleting assignWorkout with ID:", id); // Log the ID

    // Find and delete the schedule
    const deletedAssignWorkout = await assignWorkout.findByIdAndDelete(id);

    if (!deletedAssignWorkout) {
      console.log("assignWorkout not found for ID:", id);
      return res.status(404).json({ message: "assignWorkout not found" });
    }

    console.log("Deleted assignWorkout:", deletedAssignWorkout);
    res.status(200).json({
      message: "AssignWorkout deleted successfully",
      deletedAssignWorkout,
    });
  } catch (error) {
    console.error("Error deleting trainer schedule:", error);
    res.status(500).json({
      message: "Failed to delete schedule",
      error: error.message,
    });
  }
};

exports.fetchDietPlans = async (req, res) => {
  try {
    console.log("Inside the fetchDietPlans function");
    const response = await assignDietPlan.find().populate({
      path: "userId", // Path to populate
      select: "username", // Fields to select
    });

    const formattedPlans = response.map((plan) => ({
      _id: plan._id,
      planname: plan.planname,
      instructions: plan.instructions,
      userId: plan.userId._id,
      userName: plan.userId.username, // Include username
    }));

    console.log("response of fetchDietPlans:", formattedPlans);
    res
      .status(200)
      .json({ message: "successfully gottt fetchDietPlans", response });
  } catch (error) {
    console.error("Error at fetchDietPlans function");
    res.status(500).json({ message: "Error got fetchDietPlans", error });
  }
};

exports.postDietPlans = async (req, res) => {
  try {
    console.log("Inside the postDietPlans function");
    const { planname, instructions, userId } = req.body;
    console.log("detils :", planname, instructions, userId);

    if (!planname || !instructions || !userId) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existingPlan = await assignDietPlan.findOne({ userId: userId });
    console.log("existing plan:", existingPlan);

    if (existingPlan) {
      console.log("Diet plan already exists");
      return res.status(406).json("Already exists the Dietplan...");
    }

    const savedDietPlan = new assignDietPlan({
      planname,
      instructions,
      userId,
    });

    await savedDietPlan.save();
    console.log("saved savedDietPlan", savedDietPlan);
    return res.status(200).json({
      message: "Successfully saved savedDietPlan",

      data: {
        _id: savedDietPlan._id,
        planname: savedDietPlan.planname,
        instructions: savedDietPlan.instructions,
        userId: savedDietPlan.userId,
      },
    });
  } catch (error) {
    console.error("Error at savedDietPlan function", error);
    return res
      .status(500)
      .json({ message: "failed at saving savedDietPlan", error });
  }
};

exports.updateDietPlan = async (req, res) => {
  try {
    const { planname, instructions, userId } = req.body;
    const planId = req.params.planId;

    // Validate input
    if (!planname || !instructions || !userId) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Find the diet plan and update it
    const updatedPlan = await assignDietPlan
      .findByIdAndUpdate(
        planId,
        { planname, instructions, userId },
        { new: true } // Return the updated document
      )
      .populate("userId", "username"); // Populate the username

    if (!updatedPlan) {
      return res.status(404).json({ error: "Diet plan not found." });
    }

    res.status(200).json({
      message: "Diet plan updated successfully",
      updatedPlan,
    });
  } catch (error) {
    console.error("Error updating diet plan:", error);
    res.status(500).json({ error: "Failed to update diet plan." });
  }
};

exports.deleteDietPlan = async (req, res) => {
  console.log("Inside backend deleteDietPlan function");
  const { id } = req.params;
  console.log("id in the backend:", id);

  try {
    const deletedDiet = await assignDietPlan.findByIdAndDelete({ _id: id });
    console.log("after the response from the backend:", deletedDiet);
    res.status(200).json({ message: "Diet plan deleted successfully" });
  } catch (error) {
    console.error("error at backend", error);
    res.status(500).json({ error: "Failed to delete diet plan" });
  }
};

exports.fetchUserProgress = async (req, res) => {
  const { trainerId } = req.query;

  try {

    if (!trainerId) {
      console.error("trainerId is missing.....");
      return res.status(400).json({ message: "Trainer ID is required" });
    }

    // 1️⃣ Fetch users assigned to the given trainer
    const assignedUsers = await Assignment.find({
      trainer: new mongoose.Types.ObjectId(trainerId),
    }).populate("user", "username");

    if (!assignedUsers.length) {
      return res.status(404).json({
        message: "No assigned users found for this trainer",
      });
    }

    // Extract user IDs from assigned users
    const userIds = assignedUsers.map((assignment) => assignment.user._id);

    //  Fetch progress data for those users WITH populated user details
    const progressData = await Progress.find({
      userId: { $in: userIds },
    }).populate("userId", "username"); 


    res.status(200).json({
      data: progressData,
      message: "Fetched all assigned users' progress successfully",
    });
  } catch (error) {
    console.error("Error at backend fetchUserProgress function:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.fetchAssignedUsers = async (req, res) => {
  try {
    const trainerId = req.params.id;
    console.log("Inside the fetchAssignedUsers function");
    const ConvertedtrainerId = new mongoose.Types.ObjectId(trainerId);
   

    const fetchUsers = await Assignment.find({
      trainer: ConvertedtrainerId,
    }).populate("user");

    res.status(200).json(fetchUsers);
  } catch (error) {
    console.error("Error at the backend fetchAssignedUsers");
    res.status(500).json(error);
  }
};

exports.fetchAllUsersProgressOfTrainer = async (req, res) => {
  try {
    const trainerId = req.params.id;

    const convertedTrainerId = new mongoose.Types.ObjectId(trainerId);

    const selectedUser = await Assignment.find({
      trainer: convertedTrainerId,
    }).select("user");

    const userIds = selectedUser.map((record) => record.user);

    const fetchUserProgress = await Progress.find({ userId: { $in: userIds } });

    res.status(200).json(fetchUserProgress);
  } catch (error) {
    console.error("Error at backend fetchAllUsersProgressOfTrainer");
    res.status(500).json({ error: error.message });
  }
};

exports.fetchTodaysClassSchedulingsTrainerDashboard = async (req, res) => {
  try {
    console.log("+++++++++++++++++++++++++++++++++");
    console.log("Inside the fetchTodaysClassSchedulingsTrainerDashboard");
    const trainerId = req.params.id;
    console.log("trainerId is:", trainerId);

    const convertedTrainerId = new mongoose.Types.ObjectId(trainerId);
    console.log("converted trainerId is:", convertedTrainerId);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    console.log("today in 955:", today);

    const tomorrow = new Date(today)
    tomorrow.setUTCDate(today.getUTCDate()+1);
    console.log("tomorrow in 959:", tomorrow);


    const schedulings = await TrainingSchedules.find({
      trainerId: convertedTrainerId, date: { $gte: today, $lt: tomorrow}
    });
    console.log("schedulings is:", schedulings);

    res.status(200).json(schedulings);
  } catch (error) {
    console.error(
      "Error at the fetchTodaysClassSchedulingsTrainerDashboard backend"
    );
    res.status(500).json({ error: error.message });
  }
};



exports.fetchUserToTrainerMessages = async(req,res)=>{
    try{
        console.log("Inside the backend fetchUserToTrainerMessages");
        const trainerId = req.params.id;
        console.log("trainerId is:",trainerId);
        
        const convertedTrainerId = new mongoose.Types.ObjectId(trainerId)
        console.log("convertedTrainerId is:",convertedTrainerId);

        const fetchedUserMessages = await userToTrainerMessage.find({trainer:convertedTrainerId}).populate({path:'user', select:'username'}).sort({timestamp: -1})

        console.log("fetchedUserMessages 991:",fetchedUserMessages);
        res.status(200).json(fetchedUserMessages)
        
    }catch(error){
        console.error("Error at the backend fetchUserToTrainerMessages");
        res.status(500).json({error:error.message})

    }
}


exports.markMessageAsSeen = async (req, res) => {
    try {
        console.log("Inside the markMessageAsSeen");
        const { messageId } = req.params;  // Get the message ID from request params
        console.log("messageId:",messageId);

        const approvalTime = new Date();
        console.log("approvalTime 1010:",approvalTime);

        

        const updatedMessage = await userToTrainerMessage.findByIdAndUpdate(
            messageId, 
            { 
                status: 'approved',
                approvedAt: approvalTime,
                seen: true
            },
            { new: true }
        ).populate('user');
        
        console.log("updated Message in 1015:",updatedMessage);


        if (!updatedMessage) {
            return res.status(404).json({ message: "Message not found" });
        }

        const notification = new Notification({
            userId: updatedMessage.user._id,
            message: `Trainer has approved your message: "${updatedMessage.text}"`,
            type: 'message_approved',
            relatedEntityId: messageId,
            read: false,
            createdAt: new Date()
        });
        await notification.save();
        console.log("Notification in 1045:",notification);
        

        res.status(200).json({ message: "Message approved", data: updatedMessage });
    } catch (error) {
        console.error("Error at markMessageAsSeen:", error);
        res.status(500).json({ error: error.message });
    }
};



exports.trainerChangePasswordSubmit = async(req,res)=>{
  try{
    console.log("Inside the trainerChangePasswordSubmit backend");
    const {newPassword, confirmPassword } = req.body;

    const trainerId = req.headers.authorization?.split("Bearer ")[1]; 
    console.log("trainerId in 720:",trainerId);
    

    if(newPassword !== confirmPassword){
      return res.status(400).json({message:"New Password and the confirmation don't match"});
    }

    const hashedPassword = await bcrypt.hash(newPassword,10);
    console.log("hashedPassword in 1104:",hashedPassword);
    

    const updatedTrainerPassword = await Trainer.findByIdAndUpdate(
      trainerId,
      {password:hashedPassword},
      {new: true}
    );

    if (!updatedTrainerPassword) {
      return res.status(404).json({
        message: "Trainer not found"
      });
    }

    console.log("updatedTrainerPassword in 743:",updatedTrainerPassword);

    res.status(200).json({
      message: "Trainer Password updated successfully"
    });

  }catch(error){
    console.error("Error at backend TrainerChangePasswordSubmit");
    
  }
}



exports.fetchNotificationsToTrainerDashboard = async (req, res) => {
  try {
    console.log("Inside the fetchNotificationsToTrainerDashboard function backend");

    const trainerId = req.params.id;
    console.log("trainerId is in 1137:", trainerId);

    // Convert trainerId to ObjectId
    const convertedTrainerId = new mongoose.Types.ObjectId(trainerId);
    console.log("convertedTrainerId is in 1140:", convertedTrainerId);

    // Corrected Query: Find messages where 'trainer' field matches convertedTrainerId
    const messages = await userToTrainerMessage.find({ trainer: convertedTrainerId });

    console.log("messages is in 1176:", messages);


    // Count the number of messages
    const messageCount = await userToTrainerMessage.countDocuments({ trainer: convertedTrainerId });

    console.log("messageCount is in 1182:", messageCount);


    // Send response
    res.status(200).json({
      success: true,
      count: messageCount,
      data: messages,
    });
  } catch (error) {
    console.error("Error at backend fetchNotificationsToTrainerDashboard:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


exports.fetchAdminMessageForTrainerDashboard = async (req, res) => {
  try {
    console.log("Inside the fetchAdminMessageForTrainerDashboard function backend");

    const sentToTrainer = await Message.find({sentTo:"Trainers"})
    console.log("sentToTrainer response in 1211 is:",sentToTrainer);
    
    // Count the number of messages
    const messageCount = await Message.countDocuments({ sentTo:"Trainers" });
    console.log("Total messages sent to Trainers in 1216:", messageCount);


    // Send response
    res.status(200).json({
      success: true,
      count: messageCount,
      data: sentToTrainer,
    });
  } catch (error) {
    console.error("Error at backend fetchAdminMessageForTrainerDashboard:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
