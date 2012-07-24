/**
 * 
 * Module dependencies.
 * 
 */
var express = require('express')
  , routes = require('./routes')
  , stylus =  require('stylus')
  , nib = require('nib')
  , encoder = require('qrcode')
  , io = require('socket.io');



/**
 * 
 * Set the vars for the app
 * 
 */
var app = module.exports = express.createServer()
  , io = io.listen(app);



/**
 * 
 * Setup Express app configuration
 * 
 */
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(stylus.middleware({
    src: __dirname + '/public',
    compile: compile
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


/**
 * 
 * This function sets Stylus to compile and utilise nib
 * 
 */
function compile(str, path){
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib())
    .import('nib');
}


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


app.configure('production', function(){
  app.use(express.errorHandler());
});



// Routes

// Presentation page
app.get('/', function(req, res){

  encoder.toDataURL('http://' + req.headers.host + '/control', function(err, png){

    res.render('index', { 
        title: 'LBi Presentation',
        image: png
    });

  });
  
});


// Mobile page
app.get('/control', function(req, res){

    res.render('index', { 
        title: 'WTFQR',
        image: ''
    });
  
});


// Set app
app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});



// Socket.io

io.sockets.on('connection', function (socket){


  // Listen and set a channel
  socket.on('setChannel', function (data){

    socket.join(data.channelName);

  });


  // Listen for the presentaion to be taken over 
  socket.on('control:control', function(data){

    socket.broadcast.to('presentation').emit('presentation:controlled', data);

  });


  // Listen for a presentation control message
  socket.on('control:message', function(data){

    socket.broadcast.to('presentation').emit('presentation:navigate', data);

  });


  // Listen for a video in the presentation control message
  socket.on('control:video', function(data){

    socket.broadcast.to('presentation').emit('presentation:video', data);

  });
  

});

