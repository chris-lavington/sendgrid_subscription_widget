const path = require('path');
const ContactList = require('./controllers/contact_list_controller');

module.exports = function(app) {
	app.get('/', function(req, res) { res.sendFile(path.join(__dirname, '/static/index.html')) });
	app.get('/success', function(req, res) { res.sendFile(path.join(__dirname, '/static/success.html')) });
	app.post('/confirmEmail', ContactList.sendConfirmation);
	app.post('/signup', function(req, res, next){
		var user_email = req.body.email;
		console.log('user_email: ' +user_email);
		ContactList.addUser(user_email, req, res);
	});
}
