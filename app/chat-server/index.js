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

				if (room) {
					console.log('found room:' + data.groupid + ' in redis');
					var roomDataObj = JSON.parse(room);
					// Make sure we don't add duplicate users
					if (!_.contains(roomDataObj.members, data.uid)) {
						roomDataObj.attributes.members.push(data.uid);
						redis.client.hset('rooms', 'room:' + roomDataObj.attributes.id, JSON.stringify(roomDataObj), function() {
							socket.emit('join_room', roomDataObj);
							socket.broadcast.to(roomDataObj.attributes.id).emit('user_joined_room', { uid: data.uid} );
						});
					}

				} else {
					console.log('did not find room: ' + data.groupid + ' in redis');
					// If the room doesn't exist in redis yet, create a new one.
					var newRoom = new Room({
						id: data.groupid,
						members: [],
						messages: []
					});
					newRoom.attributes.members.push(data.uid);
					redis.client.hset('rooms', 'room:' + newRoom.attributes.id, JSON.stringify(newRoom), function() {});
					socket.emit('join_room', newRoom);
					socket.broadcast.to(newRoom.attributes.id).emit('user_joined_room', { uid: data.uid} );
				}
			});
			//redis.client.hset('groups', 'group:' + data.groupid, )
		});

	});
};
