const express = require('express');
const authController = require('../controllers/authController')
const userController = require('../controllers/userProfileController')


const router = express.Router();

router.route('/user/:id')
    // .get(authController.protect, userController.getUser)
    .get(userController.getUser)
    .patch(userController.updateUser)
    //.patch(authController.protect, userController.updateUser)
    .put(authController.protect, userController.softDeleteUser)

module.exports = router;