require('dotenv').config();
require("./models/connection");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var playgroundsRouter = require('./routes/playgrounds');
var sessionsRouter = require('./routes/sessions');

const cors = require("cors") // Cors installation

var app = express();
app.use(cors()) // Cors installation
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/playgrounds', playgroundsRouter);
app.use('/sessions', sessionsRouter);


module.exports = app;
