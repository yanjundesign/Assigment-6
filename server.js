var express = require("express");
var app = express();
var MS = require('mongoskin');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var hostname = process.env.HOSTNAME || 'localhost';
var port = 3000;
var VALUE1 = "";
var VALUE2 = "";


var db = MS.db("mongodb://http://18.206.94.215:27017/sensorData"); //change this!!!

app.get("/", function (req, res) {
  res.send("Temperature: " + (VALUE1*1.8 + 32) + "F \r Humidity: " + VALUE2 + "%");
});

app.get("/getValue", function (req, res) {
  var ts = parseInt(req.query.ts);
	db.collection("data").findOne({ts:{$lte:ts}, ts:{$gt:0}}, function(err, result){
    res.send(JSON.stringify(result));
  });
});


app.get("/getAverage", function (req, res) {                            // edit this for A6
  var ts = parseInt(req.query.ts);
  var begin = ts;
  var end = ts;
  begin.setHours(0);
  begin.setMinutes(0);
  end.setHours(23);
  end.setMinutes(59); 

db.collection("data").find({ts:{$lte:end.getTime()}, ts:{$gt:begin.getTime()}}).toArray(function(err, result){
    var len = result.length;     // length of data
    var tempSum = 0, humSum = 0; // define the sum of tem and hum
    for (var i = 0; i < len; i++) {
      tempSum = tempSum + result[i].t; // loop data and calculate the sum
      humSum = humSum + result[i].h;
    }
    var tempAvg = len != 0 ? tempSum/len : 0;       // have average
    var humAvg = len != 0 ? humSum/len : 0;
    var ret = {                      // calculate from result
     t: tempAvg,                    // assign value
     h: humAvg
    }
    res.send(JSON.stringify(ret));
  });
});


app.get("/setValue", function (req, res) {
  var v1 = decodeURIComponent(req.query.t);
  var v2 = decodeURIComponent(req.query.h);
  VALUE1 = v1;
  VALUE2 = v2;
	var newObj = {
		t: v1,
		h: v2,
		ts: new Date().getTime()
	}

	db.collection("data").insert(newObj, function(err, result){});

  res.send(VALUE1 + "\n" + VALUE2);
});

app.use(methodOverride());
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(errorHandler());

console.log("Simple static server listening at http://" + hostname + ":" + port);
app.listen(port);
