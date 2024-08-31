const { param } = require('../routes/userRoutes');
const User = require('./../models/userModel');
const Profile = require('../models/userProfileModel');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const CustomError = require('../Utils/CustomError');
const jwt = require('jsonwebtoken');


exports.getUser = asyncErrorHandler (async (req, res, next) => {

 //  const profileId = req.params.profileId;

  const user = await Profile.find({user: req.params.id});
 // const user = await Profile.findById(req.params.id);

  if(!user){
      const error = new CustomError('User with that ID is not found', 404);
      return next(error);
  }

  res.status(200).json({
      status: 'success',
      data: {
          user
      }
  });
});

exports.updateUser = asyncErrorHandler (async (req, res, next) => {
    
    const updatedUser = await Profile.findOneAndUpdate(
        { user: req.params.id }, // Find by userid
        req.body, // Update with the request body
        { new: true, runValidators: true } // Options: return the updated document, and run validators
      );
    
    //await Profile.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

    if(!updatedUser){
        const error = new CustomError('User with that ID is not found', 404);
        return next(error);
    }

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
        });
        
});


// Soft delete user

exports.softDeleteUser = asyncErrorHandler (async (req, res, next) => {
      
        const softdeletedUser = await Profile.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
    
        if (!softdeletedUser) {
          const error = new CustomError('User with that ID is not found', 404);
          return next(error);
        }
    
        res.status(200).json({
          status: 'success',
          data: {
            user: softdeletedUser
          }
        });
    });
