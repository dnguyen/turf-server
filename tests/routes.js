var should = require('should'),
	request = require('supertest'),
	assert = require('assert');

describe('Routing', function() {

	var url = 'http://localhost:3001';

	describe('Groups', function() {
		// Test for trying to get a group with an invalid group id
		it ('Should return error for invalid group id', function(done) {
			request(url)
				.get('/api/groups/999990')
				.expect(400)
				.end(function(err, res) {
					done();
				});
		});

		// Test for trying to get a group without a group id
		it ('Should return error 400 for undefined group id', function(done) {
			request(url)
				.get('/api/groups/')
				.expect(400)
				.end(function(err, res) {
					done();
				});
		});

		// Test for getting a group by a valid group id
		it ('Should return 200 with Nittany Crossing as name', function(done) {
			request(url)
				.get('/api/groups/1')
				.expect(200)
				.end(function(err, res) {
					res.body.name.should.equal('Nittany Crossing');
					done();
				});
		});

		// Test for getting valid groups given no coordinates
		it ('Should return 400 status code for invalid coordinates', function(done) {
			request(url)
				.get('/api/validgroups')
				.expect(400)
				.end(function(err, res) {
					done();
				});
		});

		// Test for getting valid groups within certain distance of coordinnate
		it ('Should return 2 rooms, Nittany Crossing and Penn State HUB', function(done) {
			request(url)
				.get('/api/validgroups')
				.send({
					position: {
						latitude: 40.81095905,
						longitude: -77.89322398
					}
				})
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					res.body.length.should.equal(2);
					res.body[0].name.should.equal('Nittany Crossing');
					res.body[1].name.should.equal('Penn State HUB');
					done();
				});
		});

	});

});
