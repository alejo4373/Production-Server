var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('./auth/passport');
var pgSession = require('connect-pg-simple')(session);
var htmlTextSanitizer = require('./middleware/htmlTextSanitizer')
var { db } = require('./db/pgp')

var authRouter = require('./routes/auth');
var todosRouter = require('./routes/todos');
var journalRouter = require('./routes/journal');
var tagsRouter = require('./routes/tags');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

// Enable req/res logs when not testing
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  store: new pgSession({
    pool: db.$pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
  }
}))
app.use(cookieParser("new york city"));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(htmlTextSanitizer())

app.use('/api/auth', authRouter);
app.use('/api/todos', todosRouter);
app.use('/api/journal', journalRouter);
app.use('/api/tags', tagsRouter);

app.use('*', (req, res, next) => {
  res.sendFile(path.resolve('client/build/index.html'))
})
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err)
  res.status(err.status || 500);
  res.json({
    payload: null,
    message: err.message,
    error: true
  });
});

module.exports = app;
