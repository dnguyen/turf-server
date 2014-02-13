var should = require('should'),
	request = require('supertest'),
	assert = require('assert');

var Users = require('../app/models/users'),
	redis = require('../app/redis-store');

describe('Model Tests', function() {

	redis.initialize();

	describe('Users Model', function() {
		it('Should return user Lithica', function(done) {
			Users.get('eyANmDM5t').then(function(data) {
				data.username.should.equal('Lithica');
				done();
			});
		});
	});

});