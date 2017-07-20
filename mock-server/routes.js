const routes = {}
require('fs').readdirSync(require('path').join(__dirname + '/routes')).forEach(function(file) {
	Object.assign(routes, require('./routes/' + file))
})
module.exports = routes
