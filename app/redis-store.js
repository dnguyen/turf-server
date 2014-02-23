var redis = require('redis'),
	Promise = require('bluebird'),
	config = require('./config');

module.exports = {
	initialize: function() {
		var client = Promise.promisifyAll(redis.createClient());
		//Promise.promisify(client);

		client.on('error', function(err) {
			console.log('Redis error: ' + err);
		});
		module.exports.client = client;

	}
};