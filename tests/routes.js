var should = require('should'),
	request = require('supertest'),
	assert = require('assert');

describe('Routing', function() {

	var url = 'http://localhost:3001';

	describe('Users', function() {
		it ('POST /api/users Should return error for invalid username or password', function(done) {
			request(url)
				.post('/api/users')
				.expect(400)
				.end(function(err, res) {
					done();
				});
		});

		it ('POST /api/users Should return 400 for duplicate username', function(done) {
			request(url)
				.post('/api/users')
				.expect(400)
				.send({
					username: 'Lithica',
					password: 'test'
				})
				.end(function(Err, res) {
					done();
				});
		});

		describe('Authentication', function() {

			it ('GET /login should return 400 for invalid username but correct password', function(done) {
				request(url)
					.get('/login')
					.expect(400)
					.send({
						username: 'Badusername',
						password: 'test'
					})
					.end(function(err, res) {
						done();
					});
			});

			it ('GET /login should return 400 for invalid password but correct username', function(done) {
				request(url)
					.get('/login')
					.expect(400)
					.send({
						username: 'Lithica',
						password: 'badpassword'
					})
					.end(function(err, res) {
						done();
					});
			});

			it ('GET /login should return 200 and user data for valid username and password', function(done) {
				request(url)
					.get('/login')
					.expect(200)
					.send({
						username: 'lithica',
						password: 'test'
					})
					.end(function(err, res) {
						res.body.should.have.property('uid');
						res.body.should.have.property('username');
						res.body.should.have.property('token');
						res.body.uid.should.equal('eyANmDM5t');
						res.body.username.should.equal('Lithica');
						done();
					});
			});
		});
	});

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
					latitude: 40.81095905,
					longitude: -77.89322398
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
