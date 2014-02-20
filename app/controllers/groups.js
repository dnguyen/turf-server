var groups = require('../models/groups'),
	geolocation = require('../utils/geolocation');

var GroupsController = {
	getGroup: function(req, res) {
		var groupId = req.params.id;
		if (typeof groupId === 'undefined') {
			res.send(400);
			return;
		}

		groups.get(groupId).then(function(data) {
			console.log('Got group ' + groupId);
			res.json(200, data);
		}).catch(function(err) {
			res.send(400);
			return;
		});
	},

	getValidGroups: function(req, res) {
		// Send 400 error code if no position is given.
		if (typeof req.param('latitude') === 'undefined' || typeof req.param('longitude') === 'undefined') {
			res.send(400);
			return;
		}

		var userPosition = {
			latitude: req.param('latitude'),
			longitude: req.param('longitude')
		};
		groups.getValidGroups(userPosition).then(function(data) {
			console.log('Finished getting all valid groups');
			res.json(200, data);
		})
		.error(function(e) {
			console.log('error getting valid groups');
			res.send(400);
		})
		.catch(function(e) {
			console.log('catch getting valid groups');
			res.send(400);
			return;
		});
	},

	validGroup: function(req, res) {
		if (typeof req.param('latitude') === 'undefined' || typeof req.param('longitude') === 'undefined' || typeof req.param('groupid') === 'undefined') {
			res.send(400);
			return;
		}

		var userPosition = {
			latitude: req.param('latitude'),
			longitude: req.param('longitude')
		},
			groupId = req.param('groupid');

		groups.get(groupId)
		.then(function(groupData) {
			if (geolocation.distance(userPosition, { latitude: groupData.latitude, longitude: groupData.longitude }) <= groupData.radius) {
				res.send(200);
			} else {
				console.log('not valid group');
				res.send(400);
			}
		})
		.error(function(error) {
			console.log(error);
			res.send(400);
		})
		.catch(function(error) {
			console.log(error);
			res.send(400);
		});

	}
};

module.exports = GroupsController;