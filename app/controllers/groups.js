var groups = require('../models/groups');

var GroupsController = {
	getGroup: function(req, res) {
		var groupId = req.params.id;
		if (typeof groupId === 'undefined') {
			res.send(400);
			return;
		}

		groups.getGroup(groupId).then(function(data) {
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
		}).catch(function(e) {
			res.send(400);
			return;
		});
	}
};

module.exports = GroupsController;