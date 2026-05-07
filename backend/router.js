const express = require('express');
const router = express.Router();
// Handeles all the server side routes for the application
// Basically any route that will need to fetch or post data to the databse
const loginRouter = require('./routes/login');
const signupRouter = require('./routes/signup');
const updateUserInfoRouter = require('./routes/update_user_info');
const newPostRouter = require('./routes/new_post');
const postsRouter = require('./routes/posts');
const favoriteItemRouter = require('./routes/favorite_item');
const commentRouter = require('./routes/comment');
// const deleteAccountRouter = require('./routes/delete_account');

router.use('/api', loginRouter);
router.use('/api', signupRouter);
router.use('/api', updateUserInfoRouter);
router.use('/api', newPostRouter);
router.use('/api', postsRouter);
router.use('/api', favoriteItemRouter);
router.use('/api', commentRouter);
// router.use('/api', deleteAccountRouter);

module.exports = router;

