const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//create profile schema

const userProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    fullname: {
        type: String,
        required: [true, 'Please enter your name.']
    },

    username: {
        type: String,
        required: [true, 'Please enter your username.']
    },

    phoneNumber: 
    {
        type: String,
    },

    dateOfBirth:
    {
        type: Date,
    },

    contactAddress:
    {
        type: String,
    },

    bio:
    {
        type: String,
    },

    profileImage:{
        type: String,
      },

    deleted: {
        type: Boolean,
        default: false
      },
},

{
    timestamps: true,
},

)
 
const  Profile = mongoose.model('Profile', userProfileSchema);

module.exports = Profile;