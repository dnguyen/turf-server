var validator = require('validator'),
	moment = require('moment'),
	_ = require('lodash'),
	groups = require('../models/groups'),
	geolocation = require('../utils/geolocation');

function checkParamsUndefined(req, params) {
	var rtrValue = false;

	_.each(params, function(param) {
		if (typeof req.param(param) === 'undefined') {
			rtrValue = true;
		}
	});

	return rtrValue;
}

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
			res.send(400, err);
			return;
		});
	},

	getValidGroups: function(req, res) {
		// Send 400 error code if no position is given.
		if (checkParamsUndefined(req, ['latitude', 'longitude'])) {
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

	},

	insertGroup: function(req, res) {
		if (checkParamsUndefined(req, ['uid', 'name', 'radius'])) {
			res.send(400);
			return;
		}

		if (req.param('name').length > 50) {
			res.json(400, { message: 'Group name must be 50 characters or less.' });
			return;
		}

		if (!validator.isNumeric(req.param('radius')) || parseInt(req.param('radius')) <= 0) {
			res.json(400, { message: 'Radius must greater than 0. '});
			return;
		}

		var groupData = {
			name: validator.escape(req.param('name')),
			latitude: validator.escape(req.param('latitude')),
			longitude: validator.escape(req.param('longitude')),
			radius: validator.escape(req.param('radius')),
			creator: validator.escape(req.param('uid')),
			createdat: moment().format('YYYY-MM-DD HH:mm:ss')
		};

		groups.insert(groupData)
		.then(function(groupId) {
			res.json(200, { groupid : groupId });
		})
		.catch(function(error) {
			res.send(400);
		});
	}
};

module.exports = GroupsController;