var database = require('../database');

var GroupsController = {
	getValidGroups: function(req, res) {
		console.log('getValidGroups');
		var userPosition = {
			latitude: req.query.position.latitude,
			longitude: req.query.position.longitude
		};
		console.log("Req position from: " + userPosition);
		database.connection.query('SELECT * FROM groups', function(err, data) {
			if (!err) {
				var validGroups = [];
				_.forEach(data, function(group) {
					if (haversineDistance(userPosition, { latitude: group.latitude, longitude: group.longitude })) {
						validGroups.push(group);
					}
				});

				res.json(validGroups);
			}
		});
	}
};

module.exports = GroupsController;