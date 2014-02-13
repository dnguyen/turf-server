module.exports = {

	/*
		Converts a value to radians
	*/
	toRadians: function(val) {
		return val * Math.PI / 180;
	},

	/*
		Calculates the distance between 2 coordinates
	*/
	distance: function(pos1, pos2) {
		var R = 6371; // radius of the earth in KM

		var latDiff = this.toRadians(pos2.latitude - pos2.latitude),
			longDiff = this.toRadians(pos2.longitude - pos1.longitude),
			haversinLat = Math.pow(Math.sin(latDiff / 2), 2),
			haversinLong = Math.pow(Math.sin(longDiff / 2), 2);

		var a = haversinLat + (Math.cos(this.toRadians(pos1.latitude)) * Math.cos(this.toRadians(pos2.latitude)) * haversinLong);
		var c = 2 * Math.asin(Math.sqrt(a));

	 	return R * c;
	}
};