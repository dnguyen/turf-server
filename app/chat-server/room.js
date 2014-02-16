var _ = require('lodash');

var Room = function(attributes) {
	this.attributes = attributes || {};
};

// Add methods, and other data to rooms prototype.
_.extend(Room.prototype, {
	get: function(attribute) {
		return this.attributes[attribute];
	}
});

module.exports = Room;

/*module.exports = function(roomData) {
	this.id = roomData.id;
	this.name = roomData.name;
	this.users = [];
};*/