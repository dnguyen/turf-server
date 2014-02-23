var mysql = require('mysql'),
    Promise = require('bluebird'),
	config = require('./config');

module.exports = {
	initialize: function() {
        var self = this;

        var connection = mysql.createConnection(config.database);

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
	},

    // Wrapper query function so we can use promises instead of callbacks.
    query: function(query, values) {
        var resolver = Promise.defer();

        module.exports.connection.query(query, values, function(err, data) {
            if (err) throw err;
            resolver.resolve(data);
        });

        return resolver.promise;
    }
};