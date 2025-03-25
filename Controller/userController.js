//userController
const mongoose = require('mongoose');
const Attendance = require('../Model/attendanceSchema');
const Plan = require('../Model/planSchema');
const Progress = require('../Model/userProgressSchema');
const User = require('../Model/userSchema')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const assignWorkout = require('../Model/assignWorkoutSchema');
const assignDietPlan = require('../Model/assignDietPlanSchema');
const Payment = require('../Model/paymentSchema');
const SubscriptionPlan = require('../Model/subscriptionPlanSchema');
const Message = require('../Model/messageSchema');
const trainerToUserMessage = require('../Model/trainerToUserMessageSchema');
const Assignment = require('../Model/assignmentSchema');
const userToTrainerMessage = require('../Model/userToTrainerMessageSchema');

const moment = require('moment');
const PaymentReminder = require('../Model/paymentReminderSchema');
const { updateTrainerSchedules } = require('./trainerController');
const TrainingSchedules = require('../Model/trainingScheduleSchema');




exports.register = async(req,res)=>{
    console.log("inside register function");
    const {username,email,password,purpose} = req.body
    console.log(username,email,password,purpose);
    
    try{
    if(!username || !email || !password || !purpose){
        return res.status(400).json({error:"All fields are required."});
    }
        
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json("Already exists...");
        }

        console.log("Password received:", password);

        try{
         // Hash the password before saving it
         const hashedPassword = await bcrypt.hash(password, 10);
         console.log("Password hashed successfully");
         console.log("Hashed password:", hashedPassword); 

        const newUser = new User({
            username,
            email,
            password:hashedPassword,
            purpose
        })

        await newUser.save();
        console.log("User registered successfully...");
        
        return res.status(201).json({
            message: "User register successful",
            newUser: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
              }      
      })   
    }catch(hasherror){
        console.log("Hashing error:",hasherror);
        return res.status(500).json(`Hashing error: ${hasherror.message}`);  
    }
    }
    catch(error){
        return res.status(500).json("Server error.",error)
    }
   
}

//login
exports.login = async(req,res)=>{
    console.log("inside login function");
    const{email,password} = req.body;
    console.log(email,password);


    if (!email || !password) {
        return res.status(400).json("All fields are required.");
      }
    
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json("User not found.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

        // Generate a token
    const token = jwt.sign(
        { id: user._id }, 
        process.env.JWT_SECRET, 
      );

      console.log("token is:",token);
        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
              },
              token, 
      });

    }catch (error){
        return res.status(500).json("Server error. Please try again later.");
    }

      
}


exports.getAllPlans = async (req, res) => {
    try {
      const plans = await Plan.find();
      res.status(200).json({ 
        message: "Plans retrieved successfully", 
        data: plans 
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to retrieve plans", 
        error: error.message 
      });
    }
  };
  
  exports.createPlan = async (req, res) => {
    try {
      const { name, duration, price } = req.body;
      
      const newPlan = new Plan({
        name, 
        duration, 
        price
      });
  
      const savedPlan = await newPlan.save();
      
      res.status(201).json({ 
        message: "Plan created successfully", 
        data: savedPlan 
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to create plan", 
        error: error.message 
      });
    }
  };


  exports.getUserMemberships = async (req, res) => {
    try {
        console.log("inside the try block of getUserMemberships");
        
      const userId = req.params.id; // Assuming authentication middleware sets req.user
      console.log(userId);
      
      console.log("before the memberships variable");
      const memberships = await SubscriptionPlan.find({ userId: userId })
      .populate('planId', 'name duration price') // Populating plan details
      .populate('payments', 'amount status') // Populating payment status
      .select('planId payments status startDate endDate'); // Explicitly selecting status

      console.log("after the memberships:",memberships);
        
      res.status(200).json({
        status: 'success',
        data: memberships
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error fetching user memberships'
      });
    }
  };

  // Fetch user data based on their ID
exports.getUserDetails = async (req, res) => {
    try {
      const userId = req.user.id; // Assume user ID is obtained from authentication 
      // middleware
      console.log(userId);
      
      console.log("before the user variable in getUserDetails");
      
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      console.log("after the user variable.");
      
      res.json({
        success: true,
        data: {
          name: user.name,
          purpose: user.purpose,
        },
      });

      console.log("successfulll");
      
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
      console.log("error at catch block");
      
    }
  };

exports.saveProgress = async(req, res) => {
  try {
    console.log("Inside the saveProgress function");
    const { fitnessGoal, progressData } = req.body;
    const userId = req.user.id;
    console.log("userId is::", userId);
    
    const currentDate = moment(new Date()).format('DD/MM/YYYY');
    console.log("currentDate is::", currentDate);
    console.log("fitnessGoal & progressData are:", fitnessGoal, progressData);
    
    // Validate progressData structure based on fitnessGoal
    if (fitnessGoal === 'Muscle Building') {
      console.log("Inside muscle building condition");
      
      if (!progressData.chest || !progressData.arms || !progressData.waist) {
        return res.status(400).json({ message: 'Muscle building requires chest, arms, and waist measurements.' });
      }
    } 
    else if (fitnessGoal === 'Weight Loss') {
      console.log("Inside weight-loss condition");

      if (!progressData.weight || !progressData.bmi) {
        return res.status(400).json({ message: 'Weight loss requires weight and BMI data.' });
      }
    } 
    else if (fitnessGoal === 'Endurance') {
      console.log("Inside Endurance condition");

      const firstEnduranceEntry = await Progress.findOne({
        userId,
        fitnessGoal: 'Endurance'
      }).sort({ date: 1 });

      if (firstEnduranceEntry && 
          firstEnduranceEntry.progressData.exerciseType !== progressData.exerciseType) {
        return res.status(400).json({ 
          message: `You've already been tracking ${firstEnduranceEntry.progressData.exerciseType}. Please continue with the same exercise type for consistent progress tracking.`
        });
      }

      if (!progressData.exerciseType || !progressData.maxReps) {
        return res.status(400).json({ message: 'Endurance tracking requires exercise type and repetitions/duration.' });
      }
    } 
    else {
      return res.status(400).json({ message: 'Invalid fitness goal.' });
    }

    // Check if a record already exists for this date
    const existingProgress = await Progress.findOne({ 
      userId, 
      date: currentDate 
    });

    let result;
    let statusCode;
    let message;

    if (existingProgress) {
      // Update existing record
      result = await Progress.findByIdAndUpdate(
        existingProgress._id,
        {
          fitnessGoal,
          progressData
        },
        { new: true }
      );
      statusCode = 200;
      message = 'Progress updated successfully!';
    } else {
      // Create new record
      result = await new Progress({ 
        userId,
        fitnessGoal, 
        progressData,
        date: currentDate
      }).save();
      statusCode = 201;
      message = 'Progress saved successfully!';
    }

    console.log("Operation result:", result);
    return res.status(statusCode).json({ 
      message,
      progress: result 
    });
  } 
  catch (error) {
    console.error("Error saving progress:", error);
    return res.status(400).json({ message: 'Error saving progress.', error });
  }
}

exports.getuserProgress = async (req, res) => {
  try {
    console.log("inside getuserProgress function");
    
    const userId = req.user.id; // Ensure user ID is passed in the request
    console.log("userId is at getuserProgress",userId);
    
    const progressData = await Progress.find({ userId }); // Filter by user ID
    console.log("progressData at getuserProgress is",progressData);
    
    res.status(200).json({ success: true, progressData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching progress data.', error });
  }
};

exports.getUserAttendances = async(req,res)=>{
  console.log("Inside the getUserAttendaces");
  try{
    console.log("Raw user ID from auth:", req.user.id);
    
    // Check if req.user.id is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({
        message: "Invalid user ID format",
        receivedId: req.user.id
      });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id); 
    console.log("Converted userId:", userId);

    const attendanceData  = await Attendance.find({ userId });


    // If no records found, send a message
    if (attendanceData.length === 0) {
      return res.status(404).json({
        message: "No attendance records found for this user",
        queriedUserId: userId
      });
    }

    console.log("Query result Attendance Data:", attendanceData );

    
    res.status(200).json({
      message: "successful fetching user attendance",
      data: attendanceData,
      queriedUserId: userId
    });
  }
  catch(error){
    console.error("Full error:", error);
    res.status(500).json({
      message: "error fetching the user attendances",
      error: error.message
    });
  } 
}

exports.getTrainerAssignedWorkoutUser =async(req,res)=>{
  try{
    console.log("Inside the getTrainerAssignedWorkoutUser function");
    const id = req.params.id
    console.log("userId at getTrainerAssignedWorkoutUser",id);

    const objectId = new mongoose.Types.ObjectId(id);
    console.log("objectId:",objectId);
    
    
    const response = await assignWorkout.find({userId: objectId})
    console.log("response from the getTrainerAssignedWorkout:",response);
    res.status(200).json(response)
  }
  catch(error){
    console.error("error at backend getTrainerAssignedWorkoutUser");
    res.status(500).json(error)

  }
}

exports.getTrainerAssignedDiet = async (req,res)=>{
  const id = req.params.id
  console.log("Id after the req.params:",id);
  
  try{
    console.log("Inside the getTrainerAssignedDiet function");
    const objectId = new mongoose.Types.ObjectId(id);
    console.log("objectId:",objectId);
    
    
    const response = await assignDietPlan.find({userId: objectId})
    console.log("response from the getTrainerAssignedDiet:",response);
    res.status(200).json(response)
  }
  catch(error){
    console.error("Error at thte backend at getTrainerAssignedDiet",error);
    
  }
}

// Update trainer profile image
exports.updateUserProfileImage = async (req, res) => {
  try {
    const { id: userId } = req.params;

    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`; // Path to the uploaded file

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile image updated successfully",
      profileImage: updatedUser.profileImage,
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
exports.getUserProfile = async (req, res) => {
  try {
    console.log("before the response in getUserProfile");
    
      const userId = req.params.id || req.body.userId;
      console.log("userId in getUserProfile backend",userId);


    // Find the trainer by ID
    const user = await User.findById(userId);
    console.log("user at backenddd:",user);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the trainer's details
    res.status(200).json({
      username: user.username,
      purpose: user.purpose,
      profileImage: user.profileImage, // Send the current profile image URL
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user profile", error: error.message });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

exports.fetchUserData = async(req,res)=>{
  const userId = req.params.id;
  console.log("params:",req.params);
  console.log("userId:",userId);


   // Validate the ObjectId format
   if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }
  

  try{
    console.log("Inside the fetchUserData backend");
    const objectId = new mongoose.Types.ObjectId(userId);
    console.log("objectId fetchUserData backend:",objectId);

    const fetchedUser = await User.findById({_id:objectId});

    if (!fetchedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Fetched user:", fetchedUser);    
    res.status(200).json(fetchedUser)
  }
  catch(error){
    console.error("Error at backend fetchUserData");
    res.status(500).json(error)

  }
}

exports.fetchMessagesToUser = async(req,res)=>{
  try{
    console.log("inside the fetchMessagesToUser function");
    const response = await trainerToUserMessage.findById({_id})
    console.log("response after:",response);
    res.status(200).json(response)
    
  }catch(error){
    console.error("Error at backend fetchMessagesToUser");
    res.status(500).json(error)

    
  }
}

exports.userMessageToTrainer = async (req, res) => {
  try {
    console.log("Inside the backend userMessageToTrainer");
    
    // Check if the request is a POST
    if (req.method === 'POST') {
      const userId = req.body.user; // Get userId from the request body for POST
      const { text } = req.body;
      
      if (!userId || !text) {
        return res.status(400).json({ message: "User ID and message text are required" });
      }

      console.log("userId is:", userId);
      
      const userObjectId = new mongoose.Types.ObjectId(userId);
      console.log("converted userObjectId: ", userObjectId);
      
      const fetchAssignment = await Assignment.findOne({ user: userObjectId });
      console.log("fetchAssignment: ", fetchAssignment);

      if (!fetchAssignment) {
        return res.status(404).json({ message: "No trainer found for this user." });
      }

      const trainerId = fetchAssignment.trainer;
      console.log("trainerId in the backend:", trainerId);

      const newMessage = new userToTrainerMessage({
        trainer: trainerId,
        user: userObjectId,
        text: text,
        timestamp: new Date(),
      });

      await newMessage.save();
      console.log("Message saved successfully:", newMessage);

      return res.status(200).json({ trainerId, newMessage });
    } else {
      // For GET requests
      const userId = req.params.id; // Get userId from URL params for GET
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const userObjectId = new mongoose.Types.ObjectId(userId);
      const fetchAssignment = await Assignment.findOne({ user: userObjectId });

      if (!fetchAssignment) {
        return res.status(404).json({ message: "No trainer found for this user." });
      }

      return res.status(200).json({ trainerId: fetchAssignment.trainer });
    }

  } catch (error) {
    console.error("Error at the backend userMessageToTrainer", error);
    if (error.name === 'BSONError' || error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


exports.getUserSentMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = await userToTrainerMessage.find({ user: userId }).sort({ timestamp: -1 });
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
};

exports.deleteUserSentMessages = async(req,res) =>{
  try{
    console.log("inside the backend deleteUsersentMessages function");
    const { id } = req.params;
    console.log("Message ID to delete:", id);

    const deletedMessage = await userToTrainerMessage.findByIdAndDelete(id)

    if (!deletedMessage) {
      console.log("No message found with the specified ID");
      return res.status(404).json({ message: "Message not found" });

    } 

    console.log("Message deleted successfully:", deletedMessage);
    res.status(200).json({ message: "Message deleted successfully", deletedMessage });
    
  }catch(error){
    console.error("Error at the backend of deleteUsersentMessages");
    res.status(500).json({ message: "Internal Server Error", error });

  }
}


exports.fetchAllReceivedMessagesOfUser = async (req, res) => {
  try {
    console.log("inside the fetchAllReceivedMessagesOfUser backend");
    console.log("Fetching received messages for user:", req.user.id);
    const userId = req.user.id; 

    const adminMessages = await Message.find({ sentTo: { $in: ["All Members", "Users"] } });

    const convertedObjectId = new mongoose.Types.ObjectId(userId)
    console.log("convertedObjectId:",convertedObjectId);
    
    const trainerMessages = await trainerToUserMessage.find({ userId: convertedObjectId });

    console.log("Admin Messages:", adminMessages);
    console.log("Trainer Messages:", trainerMessages);

    res.status(200).json({
      success: true,
      data:{
      adminMessages,
      trainerMessages
      }
    });

  } catch (error) {
    console.error("Error fetching received messages:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};


exports.fetchPlanForDashboard = async(req,res)=>{
  try{
    console.log("Inside fetchPlanForDashboard function");
    const userId = req.params.id;
    console.log("userId in fetchPlanForDashboard:",userId);

    const convertedObjectId = new mongoose.Types.ObjectId(userId);
    console.log("convertedObjectId :",convertedObjectId);

    const fetchedPlan = await SubscriptionPlan.findOne({
      userId:convertedObjectId,
      status:'active',
    }).populate('planId','name')

    if(!fetchedPlan){
      return res.status(200).json({message: "No fetched  Plan"})
    }
    console.log("fetchedPlan 705:",fetchedPlan);



    res.status(200).json({success: true,fetchedPlan})
  }
  catch(error){
    console.error("Error at backend fetchPlanForDashboard");
    res.status(500).json({ success: false, message: "Server error" });
  }
}

const calculateProgressPercentage = (previous,latest)=>{
  if (!previous || !latest || previous === 0)
    return 0;
  return ((latest-previous)/previous) *100;
};


exports.calculateUserProgressPercentage = async(req,res)=>{
  try{
    console.log("Inside the calculateUserProgressPercentage function");
    const userId = req.params.userId;
    console.log("UserId is:",userId);

    const progresses = await Progress.find({userId}).sort({"progressData.date":-1}).limit(2);

    console.log("progresses in backend calculateUserProgressPercentage:",progresses);
    

    if (progresses.length < 2) {
      return res.status(200).json({ message: "Not enough data to calculate progress." });
  }

  const userGoal = progresses[0].fitnessGoal;
  console.log("userGoal:",userGoal);

    const latest = progresses[0].progressData;
    const previous = progresses[1].progressData;

    console.log("latest is *:",latest);
    console.log("previous is *:",previous);
    
    let progressData = {};
    // Calculate percentage progress

    if (userGoal === "Weight Loss") {
      progressData = {
          weightChange: calculateProgressPercentage(previous.weight, latest.weight),
          bmiChange: calculateProgressPercentage(previous.bmi, latest.bmi),
      };
  } else if (userGoal === "Endurance") {
      progressData = {
          maxRepsChange: calculateProgressPercentage(previous.maxReps, latest.maxReps),
      };
  } else if (userGoal === "Muscle Building") {
      progressData = {
          maxRepsChangeChest: calculateProgressPercentage(previous.chest, latest.chest),
          maxRepsChangeArms: calculateProgressPercentage(previous.arms, latest.arms),
          maxRepsChangeWaist: calculateProgressPercentage(previous.waist, latest.waist),
          maxRepsChangeShoulder: calculateProgressPercentage(previous.shoulder, latest.shoulder),
          maxRepsChangeLegs: calculateProgressPercentage(previous.legs, latest.legs),
         
      };
  } else {
      return res.status(400).json({ message: "Invalid goal type." });
  }

  // Format response
        Object.keys(progressData).forEach(key => {
          progressData[key] = progressData[key].toFixed(2) + "%";
      });

    res.status(200).json({
        success: true,
        latestProgress: latest,
        previousProgress: previous,
        progressPercentage: progressData
    });
    
  }catch(error){
    console.error("Error at the calculateUserProgressPercentage function:", error);
    res.status(500).json({ message: "Internal server error." });
    
  }
}


exports.calculateUserAttendancePercentage = async(req,res)=>{
  try{
    console.log("Inside the calculateUserAttendancePercentage function");
    const BeforeuserId = req.params.id;
    console.log("BeforeuserId is:",BeforeuserId);

    const userId = new mongoose.Types.ObjectId(BeforeuserId)
    console.log("userId:",userId);
    
    const fetchedAttendanceDays = await Attendance.countDocuments({ userId: userId})
    console.log("fetchedAttendanceDays:",fetchedAttendanceDays);


    res.status(200).json({ attendanceCount: fetchedAttendanceDays });

    
  }catch(error){
    console.error("Error at backend calculateUserAttendancePercentage");
    res.status(500).json({ error: error.message });

  }
}


exports.retrieveAdminPaymentReminder = async(req,res)=>{
  try{
    console.log("Inside the backend of retrieveAdminPaymentReminder");
    let { id } = req.params;
    console.log("Received userId:", id);

    // Ensure valid ObjectId format before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn("Invalid ObjectId format:", id);
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const convertedId = new mongoose.Types.ObjectId(id);
    console.log("Converted userId:", convertedId);

    const response = await PaymentReminder.findOne({ userId: convertedId }).sort({date: -1});

    console.log("Response from DB:", response);

    if (!response) {
      return res.status(404).json({ message: "No payment reminders found" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error at retrieveAdminPaymentReminder:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.markAsRead = async(req,res)=>{
  try{
    console.log("Inside the markAsRead function");
    const reminder  = await PaymentReminder.findByIdAndUpdate(
      req.params.id,
      {read:true},
      {new:true}
    );

    if(!reminder){
      return res.status(404).json({message: "Reminder not found"})
    }

    res.status(200).json({message:"Reminder marked as read",reminder})
    
  }catch(error){
    console.error("Inside the markAsRead function");
    res.status(500).json({ message: "Internal server error" });

  }
}


exports.markAllAsRead = async(req,res)=>{
  try{
    console.log("Inside the markAllAsRead function");
    const {userId} = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    await PaymentReminder.updateMany({ userId, read: false }, { read: true });

    res.status(200).json({ message: "All reminders marked as read" });
  } catch (error) {
    console.error("Error marking all reminders as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.fetchSchedulesOfUserDashboard = async(req,res)=>{
  try{
    console.log("Inside the backend fetchSchedulesOfUserDashboard");
    const userId = req.params.id;
    console.log("UserId in fetchSchedulesOfUserDashboard:",userId);
    
    const convertedId = new mongoose.Types.ObjectId(userId);
    console.log("convertedId in fetchSchedulesOfUserDashboard:",convertedId);

    const fetchedUserSchedule = await TrainingSchedules.find({userId:convertedId})

    console.log("fetchedUserSchedule in 907:",fetchedUserSchedule);
    res.status(200).json(fetchedUserSchedule)
    
  }
  catch(error){
    console.error("Error at the backend fetchSchedulesOfUserDashboard");
    res.status(500).json({error:error.message})

  }
}

// exports.getTrainerSeenMessageNotification = async(req,res)=>{
//   try{
//     console.log("Inside the getTrainerSeenMessageNotification");
//     const gotNotification = await userToTrainerMessage.find
    
//   }catch(error){
//     console.error("Error at backend getTrainerSeenMessageNotification");
    
//   }
// }



exports.userChangePasswordSubmit = async(req,res)=>{
  try{
    console.log("Inside the userChangePasswordSubmit backend");
    const {newPassword, confirmPassword } = req.body;

    const userId = req.headers.authorization?.split("Bearer ")[1]; 
    console.log("userId in 720:",userId);
    

    if(newPassword !== confirmPassword){
      return res.status(400).json({message:"New Password and the confirmation don't match"});
    }

    const hashedPassword = await bcrypt.hash(newPassword,10);
    console.log("hashedPassword in 1104:",hashedPassword);
    

    const updatedUserPassword = await User.findByIdAndUpdate(
      userId,
      {password:hashedPassword},
      {new: true}
    );

    if (!updatedUserPassword) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    console.log("updatedUserPassword in 743:",updatedUserPassword);

    res.status(200).json({
      message: "User Password updated successfully"
    });

  }catch(error){
    console.error("Error at backend UserChangePasswordSubmit");
    
  }
}