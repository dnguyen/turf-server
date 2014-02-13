var Users = require('../models/users');

module.exports = {
	newUser: function(req, res) {
		if (typeof req.param('username') === 'undefined' || typeof req.param('password') === 'undefined') {
			res.send(400);
			return;
		}

		Users.insert({
			username : req.param('username'),
			password : req.param('password')
		})
		.then(function(data) {
			console.log('successful insert');
			res.send(200);
		})
		.error(function(err) {
			console.log(err);
			res.json(400, err);
			return;
		})
		.catch(function(err) {
			console.log('error with insert');
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
	}
};