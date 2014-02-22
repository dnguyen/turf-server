var mysql = require('mysql'),
    Promise = require('bluebird'),
	config = require('./config');

module.exports = {
	initialize: function() {
        var self = this;

        var connection = mysql.createConnection(config.database);
        Promise.promisify(connection);
        // If database is disconnected, reinitialize the database connection.
        connection.on('error', function(err) {
            console.log('DATABASE ERROR: ', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                self.initialize();
            } else {
                throw err;
            }
        });

        module.exports.connection = connection;
	}
};