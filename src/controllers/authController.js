const User = require('./../models/userModel');
const Profile = require('../models/userProfileModel')
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('./../Utils/CustomError');
const util = require ('util');
const sendEmail = require('./../Utils/email');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({id}, process.env.SECRET_STR, {
        expiresIn : process.env.LOGIN_EXPIRES
    })
}

// for signup
exports.signup = asyncErrorHandler(async (req, res, next) => {
    const newUser = await User.create(req.body);

    // const token = jwt.sign({id: newUser._id}, process.env.SECRET_STR, {
    //     expiresIn : process.env.LOGIN_EXPIRES

    // Create profile
    const newProfile = await Profile.create({ user: newUser._id, ...req.body });

      // Associate the profile with the user
      newUser.profile = newProfile._id;

      // Associate the user with the profile
      newProfile.user = newUser._id;

    const token = signToken(newUser._id);

    // Save the user document with the profile ID
   // await newUser.save();

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user : newUser,
            profile : newProfile
        }
    });
});

//for login
exports.login = asyncErrorHandler(async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    //const {email, password} = req.body;
    if(!email || !password){
        const error = new CustomError('Please provide email ID & Password for login in!', 400);
        return next(error);
    }

    //Check if user exists with given email
    const user = await User.findOne({email}).select('+password');
    
    //const isMatch = await user.comparePasswordInDb(password, user.password);
    
    //Check if the user exists & password matches
    if (!user || await !user.comparePasswordInDb(password, user.password)){
        const error = new CustomError('Incorrect email or password', 400);
        return next(error)
    }

    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        message: 'User has logged in successfully',
        token
    })
})

//for authentication

exports.protect = asyncErrorHandler(async (req, res, next) => {
    //1. Read the token & check if it exist
    const testToken = req.headers.authorization;
    let token;
    if(testToken && testToken.startsWith('Bearer')){
         token = testToken.split(' ')[1];
    }
    if(!token){
        next(new CustomError('You are not logged in!', 401))
    }

    //2. validate the token
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR)
    
    //3. If the user exists
    const user = await user.findById(decodedToken.id);

    if(!user){
        const error = new CustomError('The user with given token does not exist');
        next(error);
    }

    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
    //4 If the user changed password after the token was issued
        if(isPasswordChanged){
        const error = new CustomError('The password has been chenged recently. Please login again', 401);
        return next(error);
    };

    //5 Allow user to access route
    req.user = user;
    next();
})

exports.restrict = (role) => {
    return (req, res, next) => {
        if(req.user.role !== role){
            const error = new CustomError('You do not have permission to perform this action')
            next(error);
        }
        next();
    }
}

//for user forgot password

exports.forgotPassword = asyncErrorHandler (async (req, res, next) => {
    //1. Get user from the DB based on the posted email
    const user = await User.findOne({email: req.body.email});
    
    if (!user){
        const error = new CustomError('we could not find the user with given email', 404);
        next(error);
    }
    
    //2. Generate a random reset token
    const resetToken = user.createResetPasswordToken();

    await user.save({validateBeforeSave: false});

    //3. Send the token back to the user email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    const message = `We have received a password reset request. Please use the below link to reset your pasword\n\n${resetUrl}\n\nThis reset password link will be valid for only 10 minutes.`
    
    try{
        await sendEmail({
            email: user.email,
            subject: 'Password change request received',
            message: message
        });

        res.status(200).json({
            status: 'success',
            message: 'password reset link send to the user email'
        })

    }catch(err){
        user.passwordRestToken = undefined;
        user.passwordResetTokenExpires = undefined
        user.save({validateBeforeSave: false});
    
        return next(new CustomError ('There was an error sending password rest email. Please try again later', 500))
    }
});

//for user reset password

exports.resetPassword = asyncErrorHandler(async (req, res, next) =>{
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken: token, passwordResetTokenExpires: {$gt:Date.now()}});

    if(!user){
        const error = new CustomError('Token is invalid or has expired!', 400);
        next(error);
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();

    user.save();

    //3. LOGIN THE USER
    const loginToken = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token: loginToken
    })
});