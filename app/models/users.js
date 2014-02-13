var Promise = require('bluebird'),
	shortid = require('shortid'),
	bcrypt = require('bcrypt-nodejs'),
	database = require('../database');

module.exports = {
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
						resolver.resolve({
							uid: user.id,
							username: user.username
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