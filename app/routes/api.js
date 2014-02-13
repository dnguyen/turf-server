var GroupsController = require('../controllers/groups'),
	UsersController = require('../controllers/users');

var ApiRoutes = function(app, passport) {
	app.get('/api/validgroups', GroupsController.getValidGroups);
	app.get('/api/groups/:id', GroupsController.getGroup);
	app.post('/api/users', UsersController.newUser);
	app.get('/login', UsersController.login);
};

module.exports = ApiRoutes;