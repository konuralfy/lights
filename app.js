require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const LightStates = require('./src/models/light_states.model')
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require("body-parser");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + process.env.MONGO_URI);

});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
});


// ----- routes -----
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use(express.static(__dirname + '/src/assets'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', function(req,res){
  res.sendFile(__dirname + '/src/index.html');
});


app.get('/light_logo', function(req,res){
  var data = fs.readFileSync('src/assets/light_logo.txt','utf8');
  var img = new Buffer(data.split(",")[1], 'base64');
  res.writeHead(200, {
   'Content-Type': 'image/png',
   'Content-Length': img.length
  });
  res.end(img);
});


app.post('/changeState', function(req,res){

  LightStates.findOneAndUpdate({name:'Light '+ req.body.name},{isOpen:(req.body.stat == 'true')}).then(() =>{
    io.emit('light', (req.body.stat == 'true'),req.body.name);
  });

  res.status(200).send();
});

app.post('/getState', function(req,res){
  LightStates.find({}).then((records) =>{
    res.json(records);
  });
});

// ----- end routes -----


io.on('connection', function(socket) {
  console.log('client connected');

});

http.listen(process.env.PORT, function(){
  console.log(`listening on ${process.env.PORT}`);
});
