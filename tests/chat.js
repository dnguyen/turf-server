var should = require('should'),
	request = require('supertest'),
	assert = require('assert'),
	io =  require('socket.io-client');

describe('Chat Socket.io Server', function() {
	var url = "http://192.168.0.100:3001";
	var options ={
		  transports: ['websocket'],
		  'force new connection': true
	};

	var socket;
	it ('Should connect to server.', function(done) {
		var client = io.connect(url, options);

		client.on('connect_', function(data) {
			data.should.have.property('uid');
			done();
		});
	});

	//it ('Should ')
	// beforeEach(function(done) {
	// 	socket = io.connect(url, options);
	// 	socket.on('connect', function() {
	// 		console.log('connecting');
	// 		done();
	// 	});
	// });

	// afterEach(function(done) {
	// 	if (socket.socket.connected) {
	// 		socket.disconnect();
	// 	}
	// 	done();
	// });

});