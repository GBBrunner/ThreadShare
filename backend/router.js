const express = require('express');
const router = express.Router();
// Handeles all the server side routes for the application
// Basically any route that will need to fetch or post data to the databse
const loginRouter = require('./routes/login');
const signupRouter = require('./routes/signup');
const deleteAccountRouter = require('./routes/delete_account');
const createCourseRouter = require('./routes/Create_Course');
const coursesRouter = require('./routes/courses');
const EnrollCourseRouter = require('./routes/Enroll_Course');
const myCoursesRouter = require('./routes/My_Courses');
const ViewStudentsRouter = require('./routes/View_Students');

router.use('/api', ViewStudentsRouter);
router.use('/api', loginRouter);
router.use('/api', signupRouter);
router.use('/api', deleteAccountRouter);
router.use('/api', createCourseRouter);
router.use('/api', coursesRouter);
router.use('/api', EnrollCourseRouter);
router.use('/api', myCoursesRouter);

module.exports = router;

