var GroupsController = require('../controllers/groups');

var ApiRoutes = function(app) {
	app.get('/api/validgroups', GroupsController.getValidGroups);
};

module.exports = ApiRoutes;