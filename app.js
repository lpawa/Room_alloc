let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let pg = require('pg');


let index = require('./routes/index');
let users = require('./routes/users');
let dbhandler = require('./routes/dbhandler');
// const formhandler = require('./routes/formhandler');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',express.static(path.join(__dirname, 'public')));

app.post('/getInfo',function (req,res,next) {
    console.log(req.body);
    if(req.body.month && req.body.year) {
        var month = req.body.month;
        var year = req.body.year;
        var obj = {
            month:month,
            year:year
        };
        if(obj.month && obj.year) {
            dbhandler.getInfo(function (info) {
                res.status(200).send(info);
            }, obj);
        }

    }
    else{
        var err = new Error('Invalid content type!');
        err.status=404;
        err.statusCode =404;
        res.status(404).send({ error: err })
    }
});

app.post('/submitQuery',function (req,res) {
    console.log(req.body);
    // dbhandler.AlterData(function (result) {
    //     res.send(result);
    // },req.body);
    if(req.body && req.body.type && req.body.date && (req.body.price || req.body.availability)) {
        var newInfo = {
            operation: "single",
            type: req.body.type,
            date: req.body.date,
            price: req.body.price,
            availability: req.body.availability
        };

        dbhandler.AlterData(function (result) {
            console.log(result.status);
            res.status(200).send('Successful!');
        }, newInfo);
    }
    else{
        let err = new Error('Invalid content type!');
        err.status = 404;
        err.statusCode = 404;
        res.status(404).send({ error: err });
    }
});
app.post('/submitform',function (req,res) {
    console.log(req.body);
    // console.log(req.body.start_date);
    // console.log(req.body.end_date);
    // console.log(req.body.type);
    // console.log(req.body.price);
    // console.log(req.body.availability);
    // console.log(req.body.days);
    // console.log(req.body.start_date);
    if(req.body && req.body.start_date && req.body.end_date && req.body.price && req.body.availability && req.body.days) {
        let s_d = new Date(req.body.start_date);
        let e_d = new Date(req.body.end_date);
        if(s_d<=e_d) {
                var newInfo = {
                operation: "bulk",
                type: req.body.type,
                start_date: req.body.start_date,
                end_date: req.body.end_date,
                price: req.body.price,
                availability: req.body.availability,
                days: req.body.days
            };

            dbhandler.AlterData(function (result) {
                console.log(result.status);
                res.status(200).send('Successful!');
            }, newInfo);
        }
        else{
            let err = new Error('Invalid content type!');
            err.status = 404;
            err.statusCode = 404;
            res.status(404).send({ error: err });
        }

    }
    else{
        let err = new Error('Invalid content type!');
        err.status = 404;
        err.statusCode = 404;
        res.status(404).send({ error: err });
    }
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {

  var err = new Error('Not Found');
  err.status = 404;
  throw(err);
  res.status(404).send({ error: err });
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
