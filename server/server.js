var serverPort=9000, 
    webDir="../app";

var express = require('express');
var bodyParser = require('body-parser')

var sys = require('sys');
var exec = require('child_process').exec;
var child;

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

function executeCommand(cmd) {
	child = exec(cmd, function (error, stdout, stderr) {
		sys.print('stdout: ' + stdout);
		sys.print('stderr: ' + stderr);
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});
}

// Start listening on incoming requests
app.listen(serverPort);
console.log('Server listening on http://localhost:'+serverPort);
console.log('Distributing site from: '+webDir);