io = require("socket.io-client");
readline = require("readline");

function randselect(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function R() { return randselect("1234567890"); }

myserver = "localhost:8080";
myroom = "";
mynick = "user" + R() + R() + R() + R();
socket = false;

interface = readline.createInterface({ input : process.stdin, output : process.stdout });


interface.on("line", function (line) {
	if (line.split(" ")[0] == "/nick"){
		mynick = line.split(" ")[1];
		socket.emit('identity', {nick: line.split(" ")[1]});
	} else if (line.split(" ")[0] == "/connect"){
		myserver = line.split(" ")[1];
		setupsocket();
	} else if (line.split(" ")[0] == "/join"){
		myroom = line.split(" ")[1];
		socket.emit('join', {room: line.split(" ")[1]});
	} else {
		socket.emit('say', { text: line });		
	}
});

function setupsocket(){
	socket = io("http://" + myserver);
	socket.on('ready', function (data) {
		socket.emit('identity', {nick: mynick});
	});
	socket.on('say', function (data) {
		if (data.speaker){
			console.log(data.speaker + ": " + data.text);
		} else {
			console.log(data.text);
		}
	});
}

console.log("To connect to a server, type /connect <address>.");
