const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './.env.dev'});

process.on('uncaughtException', (err) => {
        console.log(err.name, err.message);
        console.log('Uncaught Exception occured! Shutting down...');
        
                process.exit(1);
})

const app = require('./app');

//connect to DB
mongoose.connect(process.env.CONN_STR).then((conn) => {
        //console.log(conn);
         console.log('DB Connection Successful');
 }).catch((error) => {
         console.log('Some error has occured');
 });

//create a Server
const port = process.env.PORT || 5050;

const server = app.listen(port, () => {
        console.log(`server listening on port : ${port}`);
     })

process.on('unhandledRejection', (err) => {
        console.log(err.name, err.message);
        console.log('Unhandled rejetion occured! Shutting down...');
        
        server.close(() => {
                process.exit(1);
        })
})