var Promise = require('bluebird'),
	_ = require('lodash'),
	shortid = require('shortid'),
	database = require('../database'),
	redis = require('../redis-store'),
	geolocation = require('../utils/geolocation');

module.exports = {

	/*
		Get's a single group by id
	*/
	get: function(id) {
		var resolver = Promise.defer(),
			groupObj;

		database.query('SELECT * FROM groups where id = ?', [id])
		.then(function(group) {
			if (group.length > 0) {
				groupObj = group[0];
				return redis.client.hgetAsync('rooms', 'room:' + groupObj.id);
			} else {
				resolver.reject({
					message: 'Group with that id does not exist'
				});
			}
		})
		.then(function(roomJson) {
			var roomObj = JSON.parse(roomJson);
			groupObj.members = roomObj.attributes.members;
			console.log(groupObj);
			resolver.resolve(groupObj);
		})
		.catch(function(err) {
			resolver.reject({
				message: 'Query failed'
			});
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
