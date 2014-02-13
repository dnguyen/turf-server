var GroupsController = require('../controllers/groups');

var ApiRoutes = function(app) {
	app.get('/api/validgroups', GroupsController.getValidGroups);
	app.get('/api/groups/:id', GroupsController.getGroup);
};

module.exports = ApiRoutes;