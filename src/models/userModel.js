const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Profile = require('../models/userProfileModel');


//create a schema
//name, email, photo, role, password, confirmPassword, passwordChangedAt
const userSchema = new mongoose.Schema({

    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },

    fullname: {
        type: String,
        required: [true, 'Please enter your name.']
    },

    username: {
        type: String,
        required: [true, 'Please enter your username.'],
        unique: true
    },

    email: {
        type: String,
        required: [true, 'Please enter an email.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },

    password: {
        type: String,
        required: [true, 'Please enter a password.'],
        minlength: 8,
        select: false
    },

    confirmPassword: {
        type: String,
        required: true,
        validate: {
          validator: function(v) {
            return v === this.password;
          },
          message: props => `Passwords don't match!`
        }
      },

    role: {
        type: String,
        enum: ['doctor', 'patient', 'user'],
        default: 'user'
    },

    licenseNumber: {
        type: String,
        required: function() {
            return this.role === 'doctor'; // Required only if role is 'doctor'
        }
    },

    hospitalName: {
        type: String,
        required: function() {
            return this.role === 'doctor'; // Required only if role is 'doctor'
        }
    },

    agreedToTerms: {
        type: Boolean,
        default: true,
        required: [true, 'Please accept the terms and conditions.']
    },

    agreedTermsAt: {
        type: Date,
        default: Date.now
    },

    passwordChangedAt: Date,

    passwordResetToken: String,

    passwordResetTokenExpires: Date,

    deleted: {
        type: Boolean,
        default: false
      },
},

{
    timestamps: true,
},

)

userSchema.pre('save', async function(next) {
    if(!this.isModified('password'))
    return next();

    //encrypt the password before saving it
    this.password = await bcrypt.hash(this.password, 12);

    // Set confirmPassword to undefined only if the document is new or confirmPassword is modified
    if (!this.isNew || this.isModified('confirmPassword')) {
        this.confirmPassword = undefined;
    }
    next();
})

userSchema.methods.comparePasswordInDb = async function(pswd, pswdDB){
    return await bcrypt.compare(pswd, pswdDB);
}

userSchema.methods.isPasswordChanged = async function (JWTTimestamp){
    if(this.passwordChangedAt){
        const pswdChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        consolse.log(pswdChangedTimestamp, JWTTimestamp);
        
        return JWTTimestamp < pswdChangedTimestamp;
    }
    return false;
}

userSchema.methods.createResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    //encrypt reset token
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires = Date.now() + (10 * 60 * 1000);

    return resetToken;
}
 
const  User = mongoose.model('User', userSchema);

module.exports = User;