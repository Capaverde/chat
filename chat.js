//Tile-based Illusion Barrier
//The server is a relay node for messages, and keeps track of physics, following a list of rules of valid transformations, inside a main loop


var http = require("http");
var fs = require('fs');
var path = require('path');
var myio = require('socket.io');

function main_loop(dt){
	//for each client in clients
	//	read buffer of requests (buffer is fifo, first in first out), moving them to the processing stack (lifo, last in first out), 6 words at a time,
	// 	processing if necessary (moving results, effects to effects_buffer)
	//after processing all requests, causes, of clients, having an effect buffer filled, then, first in first out, empty this buffer completely (with the 
	//help of an effects-processing stack), (nothing goes into the next cycle of the loop), record the delta_time and send it to the next cycle of the loop

	//delta_time can determine some effects, and is needed for solving synchronicity problems, plus timestamps

	//attempt is made at keeping to a stable number of 30 cycles per second, and so the number of words per client per cycle and effects per cycle that are
	//processed are actually precalculated every cycle, based also on how behind or beyond schedule we are at the time
	//if the effects-buffer is not cleared by the last cycle, some effects can go into the next cycle to be processed there (none are ever discarded)
}


//Disagreements about time - Synchronicity problems


var srv = http.createServer(function (req, res) {
	var filePath = path.join(__dirname, 'TB.html');
	res.writeHead(200, { 'Content-Type' : 'text/html' });
	fs.createReadStream(filePath).pipe(res);
});

var io = myio(srv);

srv.listen(8080);
var uselesshash = {};

io.on('connection', function (socket) {
	socket.emit('ready', {});
	socket.on('identity', function (data) {
		if (socket.nickname){
			io.to(socket.room).emit('say', {text: socket.nickname + " is now known as " + data.nick}); 
		} else {
			if (data.room){
				socket.join(data.room);
				io.to(socket.id).emit('say', {text: "Commands are /nick <nickname> and /lusers"});
				io.to(data.room).emit('say', {text: data.nick + " has joined"}); 
				socket.room = data.room;
			} else {
				io.to(socket.id).emit('say', {text: "no room joined"});
			}
		}
		socket.nickname = data.nick;
		uselesshash[socket.id] = data.nick;
	});
	socket.on('lusers', function () {
		//socket.emit('say', {text: "List of all users in your current room: End of list."});
		if (socket.room){
			var mytext = "List of all users in your current room: ";
			var sioRoom = io.sockets.adapter.rooms[socket.room];
			var mycount = 0;
			if( sioRoom ) { 
			  Object.keys(sioRoom.sockets).forEach( function(socketId){
			    mytext += uselesshash[socketId];
			    mycount += 1;
			    if (mycount < sioRoom.length)
				mytext += ", ";
			    else
				mytext += ". ";
			  }); 
			}   
			mytext += "End of list.";
			socket.emit('say', {text: mytext});
		}
	});
	socket.on('say', function (data) {
		console.log(data);
		if (socket.room)
			io.to(socket.room).emit('say', {speaker: socket.nickname, text: data.text}); 
	});
});
