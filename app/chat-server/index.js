var _ = require('lodash'),
	io = require('socket.io');
	redis = require('../redis-store'),
	database = require('../database'),
	Users = require('../models/users');

module.exports = function(server) {
	var rooms = [];

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
				redis.client.hdel('online_users', userid, function() {
					console.log('Removed ' + userid + ' from online_users');
				});
			});
		});

	});
};
