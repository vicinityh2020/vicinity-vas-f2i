const express = require('express');
const config = require ('./config/config'); 

const adapterController = require('./routes/adapterController');


const app = express();


/* start djane instance to get data*/
const djane = require('./utils/djane').instance;

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));


app.use('/adapter', adapterController);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error =  err ;
  
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Init Djane
djane.start()

const port = config.adapter['port']; 
app.set('port', port);

const server= app.listen(port, function () {
  console.log('Listening on port: ' + port);
});


process.on('SIGTERM', function () {
	server.close( function () {
    console.log('Server terminated'); 
    djane.close().then(response => {    
      process.exit(0); 
    });
	})
}); 

