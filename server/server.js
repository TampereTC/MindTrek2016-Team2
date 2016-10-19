var serverPort=9000, 
    webDir="../app";

var express = require('express');
var bodyParser = require('body-parser')

var sys = require('sys');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var child;
var sub;
var xValues = [0];
var yValues = [0];
var zValues = [0];
var headingInDegrees;

var app = express();
app.use(bodyParser.json());	

app.use(express.static(webDir));

app.get('/move', function(req, res) {
	res.json("Move controller");
});

app.get('/move/:cmd', function(req, res) {
	console.log("Command requested ---> ");
	console.log(req.params.cmd);
	res.send("Command executed...");
	executeCommand(req.params.cmd);
});

app.get('/listen/', function(req, res) {
	console.log("Listen requested ---> ");
	res.send("Listen executed...");
	listenMqttSub();
});

function listenMqttSub(){
	sub = spawn('mosquitto_sub', ['-h', '54.93.150.126', '-t', 'team2_read', '-k', '60']);
	sub.stdout.on('data', function (data) {	
		var obj;		
		try {
			obj = JSON.parse(data);
			calculateHeading(obj);			
		} catch(e) {
			//sys.print('invalid data: ' + data);
		}
	});		
}

function calculateHeading(obj)
{
	var x = calculateAverage(obj.x, xValues);
	var y = calculateAverage(obj.y, yValues);
	var z = calculateAverage(obj.z, zValues);
	sys.print('\r\n' + x + ' : ' + y + ' : ' + z);
	//var heading = Math.atan(y/x); sivu tilt
	//var heading = Math.atan(z/x); pituus tilt
	//var heading = Math.atan(x/z);
	//var heading = Math.atan(z/y);
	//var heading = Math.atan(z/y);
	var heading = Math.atan(x/y);
	
	/*if(heading < 0)
	{
		heading = heading + (2 * Math.PI);
	}
	if(heading > (2 * Math.PI))
	{
		heading = heading - (2 * Math.PI);
	}*/
	headingInDegrees = heading * (180/Math.PI); 
	//sys.print('\r\n' + heading);
}

function executeCommand(cmd) {

	child = exec(cmd, function (error, stdout, stderr) {
		sys.print('stdout: ' + stdout);
		sys.print('stderr: ' + stderr);
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});

}

function calculateAverage(newValue, array)
{
	var value = parseInt(newValue, 10);
	if(array.length == 20)
	{
		array.shift();
	}
	array.push(value);
	var sum = 0;
	for(var i=0; i<array.length; i++)
	{
		sum = sum + array[i];
	}
	var avg = sum/array.length;
	return avg | 0; 
	
}

// Start listening on incoming requests
app.listen(serverPort);
console.log('Server listening on http://localhost:'+serverPort);
console.log('Distributing site from: '+webDir);
