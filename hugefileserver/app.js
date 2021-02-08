require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const timeout = require('connect-timeout');

const { CLIENT_HOST } = process.env;

const corsOption = {
  origin: CLIENT_HOST,
  optionsSuccessStatus: 200
};

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(timeout("180s"));
app.use(helmet({
  contentSecurityPolicy: {
    defaultSrc: ["'self'", "'unsafe-self'", "'unsafe-inline'", CLIENT_HOST],
    connectSrc: ["'self", CLIENT_HOST],
  }
}));
app.use(cors(corsOption));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.status(500).send(err.message || err);
});

module.exports = app;
