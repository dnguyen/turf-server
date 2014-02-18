var Promise = require('bluebird'),
	_ = require('lodash'),
	io = require('socket.io');
	redis = require('../redis-store'),
	database = require('../database'),
	Users = require('../models/users'),
	Room = require('./room');

// TODO: major refactoring...
//		 move socket callbacks to a new file/module.
//		 Figure out how to make redis use promises with bluebird.
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
				console.log('store ' +user.id+ ' in socket');

				socket.set('userid', user.id, function() {});
				redis.client.hset('online_users', user.id, JSON.stringify(user), function(err, rsp) {
					console.log('Stored ' + user.id + ' in online_users hash');
				});
			}).error(function(err) {
				console.log(err);
			});
		});

		socket.on('disconnect', function(data) {
			console.log('recv disconnect');
			socket.get('userid', function(err, userid) {
				if (err) throw err;
				console.log('got socket id ' + userid);
				if (userid) {
					redis.client.hdel('online_users', userid, function() {
						console.log('Removed ' + userid + ' from online_users');
					});

					// Remove user from any chat rooms that they're in
					redis.client.hgetall('rooms', function(err, rooms) {
						if (err) throw err;

						// Look through each room
						_.each(rooms, function(room) {
							room = JSON.parse(room);

							// Remove any element with disconnecting user id from the members array
							var newMembersArray = _.remove(room.attributes.members, function(user) {
								return user.uid === userid;
							});

							// Update redis with the new members array.
							room.attributes.members = newMembersArray;
							redis.client.hset('rooms', 'room:' + room.attributes.id, JSON.stringify(room), function() {
								console.log('Removed disconnected member from all chats and saved to redis');
							});
						});
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

				// Check if the user is already in the room. Only need to check if there are members in the room.
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

		socket.on('send_message', function(data) {
			console.log('recv send_message');
			console.log('sockets in room ' + data.groupid);
			console.log(io.sockets.clients(data.groupid).length);
			redis.client.hget('rooms', 'room:' + data.groupid, function(err, room) {
				if (err) throw err;
				room = JSON.parse(room);

				Users.get(data.uid).then(function(user) {
					var newMessage = {
						user: {
							uid: user.id,
							username: user.username
						},
						message: data.message
					};

					room.attributes.messages.push(newMessage);

					redis.client.hset('rooms', 'room:' + data.groupid, JSON.stringify(room), function() { });
					io.sockets.in(data.groupid).emit('new_message', newMessage);
				});
			});
		});

	});
};
