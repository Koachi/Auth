//import package
const express = require('express');
const morgan = require('morgan');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes.js');
//const adminRoutes = require('./src/routes/adminRoutes.js');
//const doctorRoutes = require('./src/routes/doctorRoutes.js');
const CustomError = require('./src/Utils/CustomError');
const globalErrorHandler = require('./src/controllers/errorController');
const cors = require('cors');


let app = express();

const logger = function(req, res, next){
    console.log('Custom middleware called')
    next();
}

app.use(logger);

app.use(express.json());
app.use(cors())

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//USING ROUTES
app.use('/api/v1', authRoutes);
app.use('/api/v1', userRoutes);

//app.use('/api/v1', adminRoutes);
//app.use('/api/v1', doctorRoutes);
app.all('*', (req, res, next) => {
    const err = new CustomError(`Can't find ${req.originalUrl} on the server!`, 404)
    next(err);
});

app.use(globalErrorHandler)

module.exports = app;