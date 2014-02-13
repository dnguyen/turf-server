var express = require('express'),
	_ = require('lodash'),
	database = require('./database'),
	config = require('./config'),
	routes = require('./routes/api'),
	TurfApiApp = express();

database.initialize();

TurfApiApp.use(express.json());
TurfApiApp.use(express.urlencoded());

var server = TurfApiApp.listen(config.port);
var io = require('socket.io').listen(server);
var groupChatRooms = { };



function userExistsInRoom(room, username) {
	var found = false;
	_.each(room.users, function(user) {
		if (user.username === username) {
			console.log('found user in room');
			found = true;
		}
	});
	return found;
}

io.sockets.on('connection', function(socket) {
	console.log("recv connection event");

	socket.on('disconnect', function(socket) {
		console.log('a user just disconnected');
	});

	socket.on('join_group', function(data) {
		console.log(data);
		console.log(data.username + ' trying to join ' + data.id);

		var newUser = {
			username : data.username
		};

		// If there is already a chat room in the map, then just add the user to the room.
		if (groupChatRooms[data.id]) {
			/*socket.get('joinedRooms', function(rooms) {
				if (rooms === null) {
					console.log(data.username + ' does not have any joined rooms');
					socket.set('joinedRooms', [], function() {
						console.log('set joinedRooms for ' + data.username);
						socket.get('joinedRooms', function(rooms2) {
							rooms2.push(groupChatRooms[data.id]);
							console.log('pushed joinedRooms ' + JSON.stringify(rooms2));
						});
					});
				}
				console.log(data.username + ' is in ' + rooms);
				console.log(rooms);
			});*/
			console.log('found chat room already in map.');
			// If user is not already in the room, add them. else just send them the group data.
			if (!userExistsInRoom(groupChatRooms[data.id], newUser.username)) {
				groupChatRooms[data.id].users.push(newUser);
			}
			socket.emit('joined_group', groupChatRooms[data.id]);
		} else {
			console.log('chat room does not exist yet...');
			// Create new chat room object in groupChatRooms map
			groupChatRooms[data.id] = {
				id: data.id,
				users: [],
				messages: []
			};
			// push the new user
			if (!userExistsInRoom(groupChatRooms[data.id], newUser.username)) {
				groupChatRooms[data.id].users.push(newUser);
			}
			console.log('pushed new user to chat room: ' + data.id);
			socket.emit('joined_group', groupChatRooms[data.id]);
		}
	});

	socket.on('chat_message', function(data) {
		console.log('recv chat_message' + data.message);
	});
});

TurfApiApp.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

routes(TurfApiApp);