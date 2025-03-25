//route.js

const express = require('express')
const router = express.Router()
const userController = require('../Controller/userController')
const { authenticate, authorizeAdmin } = require('../Middleware/authenticate')

const adminController = require('../Controller/adminController');
const trainerController = require('../Controller/trainerController');
// const { protect, restrictTo } = require('../middleware/auth');
const planController = require('../Controller/planController');
const paymentController = require('../Controller/paymentController');
const MessageController = require('../Controller/MessageController');
const attendanceController = require('../Controller/attendanceController');
const multerConfig = require('../Middleware/multerMiddleware');
const {authenticate2} = require('../Middleware/authenticate');



router.get('/plans', userController.getAllPlans);
router.get('/user/memberships/:id', userController.getUserMemberships);
router.post('/plans', userController.createPlan);

router.get('/user-details', authenticate2, userController.getUserDetails);
router.post('/userprogress', authenticate2,userController.saveProgress);
router.get('/getuserprogress', authenticate2,userController.getuserProgress);

router.get('/getuser-attendances', authenticate2,userController.getUserAttendances);
router.get('/gettrainer-schedules/:id',userController.fetchSchedulesOfUserDashboard);

// register

router.post('/register',userController.register)
router.post('/login',userController.login)

router.post('/trainer-login',trainerController.trainerlogin)

router.post('/user-messages',userController.userMessageToTrainer)
router.get('/user-messages/:id',userController.userMessageToTrainer)
router.get('/user-sent-messages/:userId', userController.getUserSentMessages);
router.delete('/delete-usermessages/:id', userController.deleteUserSentMessages);


router.get('/fetch-all-user-messages',authenticate,userController.fetchAllReceivedMessagesOfUser)

router.get('/fetch-plan-userdashboard/:id',userController.fetchPlanForDashboard)

router.get('/progress-percentage-user/:userId',userController.calculateUserProgressPercentage)

router.get('/fetch-attendance-userdashboard/:id',userController.calculateUserAttendancePercentage)

router.get('/get-all-users',trainerController.fetchAllUsers)
router.get('/get-all-users/:id',trainerController.fetchAllUsers)
router.get('/get-all-users-progress',trainerController.fetchUserProgress)


router.post('/assign-workouts',trainerController.assignWorkouts)
router.get('/get-dietplans',trainerController.fetchDietPlans)

router.post('/post-dietplans',trainerController.postDietPlans)
router.put("/update-dietplan/:planId", trainerController.updateDietPlan);
router.delete('/delete-dietplan/:id',trainerController.deleteDietPlan)


router.get('/getTrainerAssignedWorkoutUser/:id',userController.getTrainerAssignedWorkoutUser)
router.get('/getTrainerAssignedDietUser/:id',userController.getTrainerAssignedDiet)


router.put('/update-assign-workoutplan/:id',trainerController.updateAssignWorkoutPlan)
router.delete('/delete-assignworkout/:id',trainerController.deleteAssignWorkout)
router.get('/get-all-workouts',trainerController.getWorkouts)


router.put('/trainer-change-password',trainerController.trainerChangePasswordSubmit)


router.get('/trainer/:id/profile', trainerController.getTrainerProfile);
router.get('/user/:id/profile', userController.getUserProfile);
router.get('/admin/:id/profile', adminController.getAdminProfile);

router.get('/fetchNotificationsToTrainerDashboard/:id', trainerController.fetchNotificationsToTrainerDashboard);
router.get('/fetchAdminMessageForTrainerDashboard', trainerController.fetchAdminMessageForTrainerDashboard);

router.get('/trainer/:id', trainerController.getTrainerProfile);
router.put('/trainer/:id/profile-image',multerConfig.single('profileImage'), trainerController.updateTrainerProfileImage);

router.get('/user/:id', userController.getUserProfile);
router.put('/user/:id/profile-image',multerConfig.single('profileImage'), userController.updateUserProfileImage);

router.get('/admin/:id', adminController.getAdminProfile);
router.put('/admin/:id/profile-image',multerConfig.single('profileImage'), adminController.updateAdminProfileImage);

router.put('/admin-change-password',adminController.adminChangePasswordSubmit)

router.post('/logout', trainerController.logout);

router.get('/assignments', adminController.getAllAssignments);
router.post('/assign-trainer', adminController.createAssignment);
router.put('/assignments/:id', adminController.updateAssignment);
router.delete('/assignments/:id', adminController.deleteAssignment);
router.get('/assignments/user/:userId', adminController.getAssignmentByUser);


router.get('/plans', planController.getAllPlans);
router.post('/plans',planController.createPlan);
router.put('/plans/:id', planController.updatePlan);
router.delete('/plans/:id', planController.deletePlan);


router.post('/create-order', paymentController.createOrder);
router.post('/verify-payment', paymentController.verifyPayment);
router.get('/payment-history', paymentController.getPaymentHistory );
router.get('/trainerToUsermessages/trainer/:trainerId', MessageController.getTrainerSentMessages);

router.get('/trainer-messages', MessageController.getTrainerMessages);
router.post('/messages', MessageController.sendMessage);
router.post('/trainerToUsermessages', MessageController.trainerToUserMessage);

router.get('/trainerToUsermessages', MessageController.getTrainerToUserMessages);
router.delete('/trainerToUsermessages/:id', MessageController.deleteTrainerToUserMessages);


router.get('/messages', MessageController.getMessages);
router.get('/messages/:id', MessageController.getSingleMessage);
router.delete('/messages/:id', MessageController.deleteMessage);


router.get('/admin-fetchNoPlanUsers', adminController.fetchNoPlanUsers);
router.get('/admin-fetchAllUsersAttendance', adminController.fetchAllUsersAttendances);

router.get('/admin-fetchAllTrainersAttendance', adminController.fetchAllTrainersAttendances);

router.get('/user-retrieveAdminPaymentReminder/:id', userController.retrieveAdminPaymentReminder);

router.put('/user-change-password',userController.userChangePasswordSubmit)

router.get('/fetchScheduleOfUserDashboard/:id', userController.fetchSchedulesOfUserDashboard);

router.put('/user-mark-notification-read/:id', userController.markAsRead);
router.post('/user-mark-all-notifications-read', userController.markAllAsRead);

router.get('/fetchTrainer-all-user-progress/:id', trainerController.fetchAllUsersProgressOfTrainer);

router.get('/fetchTodaysClassSchedulingsTrainerDashboard/:id', trainerController.fetchTodaysClassSchedulingsTrainerDashboard);

router.get('/fetchUserToTrainerMessages/:id', trainerController.fetchUserToTrainerMessages);

router.put('/mark-seen/:messageId', trainerController.markMessageAsSeen);

router.get('/attendance', attendanceController.getAttendance);
router.post('/attendance', attendanceController.markAttendance);
router.put('/attendance/:id', attendanceController.updateAttendance);
router.get('/attendance/stats', attendanceController.getAttendanceStats);

router.get('/all-day-trainer-attendance', attendanceController.getAllDayTrainersAttendance);

router.get('/getuserattendance/:id', trainerController.getTrainersAllUserAttendances);
router.get('/getuser-attendance/today/:trainerId', trainerController.getTodayUserAttendances);

router.post('/mark-userattendance', trainerController.markUserAttendances);
router.put('/update-userattendance/:id', trainerController.updateUserAttendances);
router.delete('/delete-userattendance/:id', trainerController.deleteUserAttendances);



router.post('/add-schedules',trainerController.addtrainerSchedules)
router.put('/update-schedules/:id',trainerController.updateTrainerSchedules)
router.get('/add-schedules',trainerController.gettrainerSchedules)
router.delete('/delete-schedules/:id',trainerController.deleteTrainerSchedules)


router.post('/admin-register',adminController.createAdmin);
router.post('/admin-userregister',adminController.userregister);
router.get('/admin-fetchFullDetails',adminController.fetchFullDetails);
router.get('/admin-fetch-user-attendance',adminController.getAllUsersAttendance);
router.post('/send-reminder-payment/:id',adminController.sendPaymentReminder);


router.get('/admin-fetchusers',adminController.fetchUsers);
router.get('/admin-fetch-All-users',adminController.fetchAllUsers);
router.get('/admin-fetch-All-trainers',adminController.fetchAllTrainers);
router.get('/admin-fetch-TotalRevenue',adminController.getTotalRevenue);
router.get('/admin-fetch-revenueForChart',adminController.revenueForChart);
router.get('/trainer-fetchAssign-users/:id',trainerController.fetchAssignedUsers);


router.get('/admin-userregister',adminController.getUsers);
router.post('/admin-login',adminController.adminlogin);
router.post('/admin-attendance',adminController.adminlogin);
router.put("/admin-user/:id", adminController.updateUser);
router.delete("/admin-user/:id", adminController.deleteUser);


router.get('/fetch-userdata/:id',userController.fetchUserData);
router.get('/fetch-trainerdata/:id',trainerController.fetchTrainerData);
router.get('/fetch-admindata/:id',adminController.fetchAdminData);

router.post('/admin-trainerregister', adminController.trainerregister);
router.get('/admin-trainerregister', adminController.getTrainers);
router.put('/trainer/:id', adminController.updateTrainer);
router.delete('/trainer/:id', adminController.deleteTrainer);


module.exports = router