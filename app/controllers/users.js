var Users = require('../models/users');

module.exports = {
	newUser: function(req, res) {
		if (typeof req.param('username') === 'undefined' || typeof req.param('password') === 'undefined') {
			res.send(400);
			return;
		}

		// Insert the user, get the user's data and return it to the client.
		Users.insert({
			username : req.param('username'),
			password : req.param('password')
		})
		.then(function(userId) {
			return Users.get(userId);
		})
		.then(function(userData) {
			userData.password = req.param('password');
			return Users.login(userData);
		})
		.then(function(rtrUserData) {
			res.json(200, rtrUserData);
		})
		.error(function(err) {
			res.json(400, err);
			return;
		})
		.catch(function(err) {
			res.send(400);
			return;
		});
	},

	/*
		On successful login, hand client their user id, username, and access token
	*/
	login: function(req, res) {
		if (typeof req.param('username') === 'undefined' || typeof req.param('password') === 'undefined') {
			res.send(400);
			return;
		}

		Users.login({
			username: req.param('username'),
			password: req.param('password')
		}).then(function(data) {
			console.log('successful login');
			console.log(data);
			res.json(200, data);
		})
		.error(function(err) {
			console.log('login error');
			console.log(err);
			res.send(400, err);
		});
	},

	/*
		Authenticates a user's token
	*/
	auth: function(req, res) {
		if (typeof req.param('uid') === 'undefined' || typeof req.param('token') === 'undefined') {
			res.send(400);
			return;
		}

		Users.auth({
			uid: req.param('uid'),
			token: req.param('token')
		}).then(function() {
			res.send(200);
		})
		.error(function(err) {
			res.send(400, err);
		});
	}
};