var redis = require('redis'),
	config = require('./config');

module.exports = {
	initialize: function() {
		var client = redis.createClient();

		client.on('error', function(err) {
			console.log('Redis error: ' + err);
		});
		module.exports.client = client;

	}
};