var _ = require('lodash'),
	uuid = require('node-uuid'),
	database = require('../database'),
	io = require('socket.io');

module.exports = function(server) {
	var rooms = { },
		users = { };

	module.exports.server = server;
	io = io.listen(server);

	io.sockets.on('connection', function(socket) {
		// Client will send server desired username.
		// Send back a uuid for the client to use
		socket.on('connect_', function(data) {
			socket.emit('connect_', {
				uid: newuuid
			});
		});
		// When a client connects, hand them a unique id to use for their session.
		var newuuid = uuid.v4();
		console.log("Creating uuid: " + newuuid);

	});
};
