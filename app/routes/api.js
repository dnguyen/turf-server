var GroupsController = require('../controllers/groups'),
	UsersController = require('../controllers/users');

var ApiRoutes = function(app, passport) {
	app.get('/api/validgroups', GroupsController.getValidGroups);
	app.post('/api/groups', GroupsController.insertGroup);
	app.get('/api/groups/:id', GroupsController.getGroup);
	app.get('/api/groups/:id/valid', GroupsController.validGroup);
	app.post('/api/users', UsersController.newUser);
	app.get('/login', UsersController.login);
	app.get('/auth', UsersController.auth);
};

module.exports = ApiRoutes;