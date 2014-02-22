var Promise = require('bluebird'),
	_ = require('lodash'),
	shortid = require('shortid'),
	database = require('../database'),
	geolocation = require('../utils/geolocation');

module.exports = {

	/*
		Get's a single group by id
	*/
	get: function(id) {
		var resolver = Promise.defer();

		database.connection.query('SELECT * FROM groups WHERE id = ?', [id], function(err, group) {
			if (!err) {
				if (group.length > 0) {
					resolver.resolve(group[0]);
				} else {
					resolver.reject({
						error: true,
						message: 'Group with that id does not exist'
					});
				}
			} else {
				resolver.reject({
					error: true,
					message: 'Query failed'
				});
			}
		});

		return resolver.promise;
	},

	insert: function(data) {
		var resolver = Promise.defer(),
			newGroupId = shortid.generate();

		database.connection.query(
			"INSERT INTO groups (id, name, latitude, longitude, radius, creator, createdat) VALUES (?, ?, ?, ?, ?, ?, ?)",
			[newGroupId, data.name, data.latitude, data.longitude, data.radius, data.creator, data.createdat],
			function(err, rsp) {
				if (err) throw err;

				resolver.resolve(newGroupId);
			}
		);

		return resolver.promise;
	},

	/*
		Returns array of groups that are close to a given coordinate position.
	*/
	getValidGroups: function(position) {
		var resolver = Promise.defer();

		database.connection.query('SELECT * FROM groups', function(err, data) {
			if (!err) {
				var validGroups = [];
				_.forEach(data, function(group) {
					console.log(geolocation.distance(position, { latitude: group.latitude, longitude: group.longitude }) + ' <= ' + group.radius);
					if (geolocation.distance(position, { latitude: group.latitude, longitude: group.longitude }) <= group.radius) {
						validGroups.push(group);
					}
				});

				if (validGroups.length > 0) {
					resolver.resolve(validGroups);
				} else {
					resolver.reject('Found no groups');
				}
			} else {
				resolver.reject(err);
			}
		});

		return resolver.promise;
	}
};
