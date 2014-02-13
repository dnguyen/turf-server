var Promise = require('bluebird'),
	uuid = require('node-uuid'),
	shortid = require('shortid'),
	bcrypt = require('bcrypt-nodejs'),
	database = require('../database'),
	redis = require('../redis-store');

module.exports = {
	get: function(userId) {
		var resolver = Promise.defer();

		// If the user data already exists in redis, just fetch it from redis.
		// Else do a sql query to get the data.
		redis.client.exists('user:' + userId, function(err, exists) {
			if (err) throw err;

			if (exists) {
				console.log('Found user:' + userId + ' in redis.');
				redis.client.get('user:' + userId, function(err, user) {
					if (err) throw err;

					resolver.resolve(JSON.parse(user));
				});
			} else {
				database.connection.query(
					'SELECT * FROM users WHERE id = ?',
					[userId],
					function(err, users) {
						if (err) throw err;

						if (users.length > 0) {
							var user = users[0];
							resolver.resolve(user);
						} else {
							resolver.reject({ message: 'Invalid user id' });
						}
					}
				)
			}
		});

		return resolver.promise;
	},

	insert: function(userData) {
		var resolver = Promise.defer();
		// Check if username already exists
		this.exists(userData.username).then(function(rtr) {
			if (!rtr) {
				database.connection.query(
					'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
					[shortid.generate(), userData.username, bcrypt.hashSync(userData.password, bcrypt.genSaltSync(8), null)],
					function(err, res) {
						if (err) throw err;

						resolver.resolve();
					}
				)
			} else {
				resolver.reject({ message : 'Username already exists.' });
			}
		}).catch(function (err) {
			throw err;
		});

		return resolver.promise;
	},

	exists: function(username) {
		var resolver = Promise.defer();

		database.connection.query(
			'SELECT username FROM users WHERE username = ?',
			[username],
			function(err, users) {
				if (err) throw err;

				if (users.length > 0) {
					resolver.resolve(true);
				} else {
					resolver.resolve(false);
				}
			}
		)

		return resolver.promise;
	},

	login: function(userData) {
		var resolver = Promise.defer();

		database.connection.query(
			'SELECT * FROM users WHERE username = ?',
			[userData.username],
			function(err, users) {
				if (err) throw err;

				if (users.length > 0) {
					var user = users [0];
					// Password matches
					if (bcrypt.compareSync(userData.password, user.password)) {
						var token = uuid.v4();
						user.token = token;
						// Store the user in redis for faster look ups
						redis.client.set('user:' + user.id, JSON.stringify(user), function() {
							console.log('finished setting redis');
						});
						resolver.resolve({
							uid: user.id,
							username: user.username,
							token: token
						});
					} else {
						resolver.reject({ message: 'Invalid username or password' });
					}
				} else {
					resolver.reject({ message: 'Invalid username or password' });
				}
			}
		)

		return resolver.promise;
	}
};