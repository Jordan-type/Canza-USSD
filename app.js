const chalk = require('chalk')
const express = require("express");
const cookieParser = require('cookie-parser')
const cors = require('cors')
require('dotenv').config();

// imports
const ussdRouter = require("./services/ussd");
require('./utils/mongoDB');

// define app
const app = express();

const port = process.env.PORT || 3000;

//  middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser())   // cookie parser
app.use(cors())           // enable CORS


// routes middleware
app.use('/', ussdRouter);

// Import routes

app.listen(port, () => {
    console.log(`
    ${chalk.green('✓')} ${chalk.blue(`listening on ${port}.` )}` )
});

