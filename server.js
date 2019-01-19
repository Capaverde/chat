var http = require("http");
var fs = require('fs');
var path = require('path');
var myio = require('socket.io');
var myport = process.argv[2] || process.env.PORT || "8080";

var srv = http.createServer(function (req, res) {
	if (req.url == "/client.js"){
		res.writeHead(200, {'Content-Type' : 'text/plain'});
		fs.createReadStream(__dirname + "/client.js").pipe(res);
	} else if (req.url == "/server.js"){
		res.writeHead(200, {'Content-Type' : 'text/plain'});
		fs.createReadStream(__dirname + "/server.js").pipe(res);
	} else if (req.url == "/package.json"){
		res.writeHead(200, {'Content-Type' : 'text/plain'});
		fs.createReadStream(__dirname + "/package.json").pipe(res);
	} else {
		res.writeHead(200, {'Content-Type' : 'text/html'});
		res.end("* <a href=\"/server.js\">/server.js</a><br/>* <a href=\"/client.js\">/client.js</a><br/>* <a href=\"/package.json\">/package.json</a>");
	}
});

var io = myio(srv);



srv.listen(myport);
console.log("Listening on port " + myport);

io.on('connection', function (socket) {
	socket.emit('ready', {});
	socket.on('identity', function (data) {
		if (socket.nickname){
			io.to(socket.room).emit('say', {text: socket.nickname + " is now known as " + data.nick}); 
		} else {
			io.to(socket.id).emit('say', {text: "Commands are /nick <nickname> and /join <channelname>"});
		}
		if (data.nick && data.nick.length >= 3 && data.nick.length <= 16)
			socket.nickname = data.nick;
		else
			io.to(socket.id).emit('say', {text: "Invalid nickname format. It must be a 3 to 16 characters word."});
	});
	socket.on('join', function (data) {
		if (data.room){
			if (socket.room){
				socket.leave(socket.room);
			}
			socket.join(data.room);
			io.to(data.room).emit('say', {text: socket.nickname + " has joined " + data.room}); 
			socket.room = data.room;			
		}	
	});
	socket.on('say', function (data) {
		if (socket.room)
			io.to(socket.room).emit('say', {speaker: socket.nickname, text: data.text}); 
	});
});
