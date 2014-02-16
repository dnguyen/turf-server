var _ = require('lodash'),
	io = require('socket.io');
	redis = require('../redis-store'),
	database = require('../database'),
	Users = require('../models/users'),
	Room = require('./room');

module.exports = function(server) {
	module.exports.server = server;
	io = io.listen(server);

	io.sockets.on('connection', function(socket) {
		// Connect message should come after a successful login.
		// Client should have their user id and access token to give.
		socket.on('connect_', function(data) {
			console.log('recv connect_');
			Users.get(data.uid).then(function(user) {
				// Store user id in the socket and redis.
				socket.set('userid', user.id, function() {});
				redis.client.hset('online_users', user.id, JSON.stringify(user), function(err, rsp) {
					console.log('Stored ' + user.id + ' in online_users hash');
				});
			}).error(function(err) {
				console.log(err);
			});
		});

		socket.on('disconnect', function(data) {
			socket.get('userid', function(err, userid) {
				if (err) throw err;
				if (userid) {
					redis.client.hdel('online_users', userid, function() {
						console.log('Removed ' + userid + ' from online_users');
					});
				}
			});
		});

		socket.on('join_room', function(data) {
			console.log('recv: join_room from ' + data.uid);
			redis.client.hget('rooms', 'room:' + data.groupid, function(err, room) {

				socket.join(data.groupid);

				var roomObj,
					userInRoom = false;

				// If the room hasn't been stored in redis yet, create a new room object to use.
				if (room) {
					roomObj = JSON.parse(room);
				} else {
					roomObj = new Room({
						id: data.groupid,
						members: [],
						messages: []
					});
				}

				// Check if the user is already in the room. Only need to check if there members in the room.
				if (roomObj.attributes.members.length > 0) {
					_.each(roomObj.attributes.members, function(usr) {
						if (usr.uid === data.uid) {
							userInRoom = true;
						}
					});
				}

				// Fetch the users data, add them to the members array, store the updated room data back
				// into redis and let the client know that they can join the room. Send the client room data.
				Users.get(data.uid).then(function(user) {
					roomObj.attributes.members.push({
						uid: data.uid,
						username: user.username
					});

					if (!userInRoom) {
						redis.client.hset('rooms', 'room:' + roomObj.attributes.id, JSON.stringify(roomObj), function() {});
						socket.emit('join_room', roomObj);
						socket.broadcast.to(roomObj.attributes.id).emit('user_joined_room', { uid: data.uid, username: user.username } );
					} else {
						socket.emit('join_room', roomObj);
					}
				});

			});
		});

	});
};
