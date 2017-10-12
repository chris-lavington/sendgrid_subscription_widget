const sg = require('sendgrid')(process.env.SG_API_KEY);
sg.globalRequest.headers['User-Agent'] = 'subscription-widget/1.0.0';

const path = require('path');
const Settings = require('../../settings');
const optIn = 'opt-in';

function prepareConfirmationEmail(reqBody) {
	const subject = "Please Confirm Your Email Address";
	const url = formatUrl(Settings.url) + '/success';
	const link = "<a href='" + url + "'>this link</a>"
	const mailText = "Thanks for signing up! Click " + link + " to sign up!  This link will be active for 24 hours.";

	var emailBody = {
	  personalizations: [
	    {
	      to: [
	        {
	          email: reqBody.email,
	        }
	      ],
	      subject: subject,
	      custom_args: {
	      	type: optIn,
	      	time_sent: String(Date.now()),
	      },
	      substitutions: {
	      	link_insert: link
	      }
	    },
	  ],
	  from: {
	    email: Settings.senderEmail,
	    name: Settings.senderName,
	  },
	  content: [
	    {
	      type: "text/html",
	      value: mailText,
	    }
	  ]
	}

	const templateId = Settings.templateId;
	if (templateId) emailBody.template_id = templateId;

	for (key in reqBody) {
		emailBody.personalizations[0].custom_args[key] = reqBody[key];
	}

	return emailBody;
}

function prepareNotificationEmail(reqBody) {
	const subject = "New email signup";
	const mailText = "A new person just confirmed they would look to receive your emails via your email subscription widget.<br/><b>Name: </b>" + reqBody.first_name + " " + reqBody.last_name + "<br/><b>Email: </b>" + reqBody.email;

	var emailBody = {
	  personalizations: [
	    {
	      to: [
	        {
	          email: Settings.notificationEmail,
	        }
	      ],
	      subject: subject
	    },
	  ],
	  from: {
	    email: Settings.senderEmail,
	    name: Settings.senderName,
	  },
	  content: [
	    {
	      type: "text/html",
	      value: mailText,
	    }
	  ],
	}

	return emailBody;
}

// Send confirmation email to contact with link to confirm email
exports.sendConfirmation = (req, res, next) => {
	var request = sg.emptyRequest({
		method: 'POST',
		path: '/v3/mail/send',
		body: prepareConfirmationEmail(req.body)
	});

	sg.API(request, function(error, response) {
		if (error) {
			console.log('Error response received');
		}

		if (response.statusCode >= 200 && response.statusCode < 300) {
			res.sendFile(path.join(__dirname, '../static/check-inbox.html'));
		} else {
			res.sendFile(path.join(__dirname, '../static/error.html'));
		}
	});
}

exports.getEmail = function(req, res, next){

};

// Create new contact and add contact to given list
exports.addUser = function(req, res, next) {
	addUserToList(req.body[0], function() {
		//send notification about the new signup
		if (Settings.sendNotification) {
			console.log("Sending notification");

			var request = sg.emptyRequest({
				method: 'POST',
				path: '/v3/mail/send',
				body: prepareNotificationEmail(req.body[0])
			});

			sg.API(request, function(error, response) {
				if (error) {
					console.log('Error sending notification');
				}
			});
		}
		res.sendStatus(200);
	});
	console.log('req.body[0] new: ' +req.body[0].email);
	const fetch = require('node-fetch');
		const couponUrl = 'https://lovelycards.co.uk/rest/V1/bangerkuwranger/couponcode/getCouponCode/';

		var couponHeaders = {
		  'Content-type': 'application/json',
		  'Authorization': 'Bearer wijraa4ky8l23f4vss8oj3swdumcxm66'
		  };

		var couponDataString = '{"ruleId":"2","custId":"0"}';

		var couponOptions = {
		  method: 'POST',
		  headers: couponHeaders,
		  body: couponDataString
		 };

		fetch(couponUrl,couponOptions)
		  .then(function(res) {
		      return res.json();
		  }).then(function(json) {
		      	console.log('json: ' +json);
		      	var ticket = json;



		    	function prepareOfferCodeEmail(userEmail) {
					const subject = "Your Somerset & Wood Offer Code";
					const couponCode = ticket;
					const mailText = "Thanks for signing up! Here is your offer code to use during checkout: " + couponCode;
					console.log('offerCodey: ' +couponCode);
					var emailBody = {
						  personalizations: [
						    {
						      to: [
						        {
						        email: userEmail,
						        }
						      ],
						      subject: subject,
						      substitutions: {
						      	offer_code: couponCode
						      }
						    },
						  ],
						  from: {
						    email: Settings.senderEmail,
						    name: Settings.senderName,
						  },
						  content: [
						    {
						      type: "text/html",
						      value: mailText,
						    }
						  ]
					};

						//const templateId = Settings.templateId;
						//if (templateId) emailBody.template_id = templateId;

						return emailBody;
				}

				// Send offer code to customer
					var request = sg.emptyRequest({
						method: 'POST',
						path: '/v3/mail/send',
						body: prepareOfferCodeEmail()
					});

					sg.API(request, function(error, response) {
						if (error) {
							console.log('Error: ' +error);
							console.error( 'SENDGRID ERROR', response );
						}
					});


		  }).catch(function(err) {
		      console.log(err);
		  });
}

function addUserToList(emailBody, callback) {
	console.log(emailBody);

	var ignoreFields = ['ip', 'sg_event_id', 'sg_message_id', 'useragent', 'event',
		'url_offset', 'time_sent', 'timestamp', 'url', 'type', 'smtp-id'];

	var customFields = [{}];
	var customFieldArr = [];

	for (key in emailBody) {
		if (!stringInArray(key, ignoreFields)) {
			customFields[0][key] = emailBody[key];
			if (key != 'email' && key != 'first_name' && key != 'last_name') {
				customFieldArr.push(key);
			}
		}
	}

	checkAndAddCustomFields(customFieldArr, function() {
		const emailType = emailBody.type;
		const timestamp = parseInt(emailBody.time_sent);
		const listId = Settings.listId;
		const secondsInDay = 86400;
		const timeElapsed = (Date.now() - timestamp) / 1000;

		// Confirm email type is opt in and link has been clicked within 1 day
		if (emailType == optIn && timeElapsed < secondsInDay) {
			var request = sg.emptyRequest({
				method: 'POST',
				path: '/v3/contactdb/recipients',
				body: customFields
			});

			sg.API(request, function(error, response) {
		    	if (listId) {
					var contactID = JSON.parse(response.body.toString()).persisted_recipients[0];
					var request = sg.emptyRequest({
						method: 'POST',
						path: '/v3/contactdb/lists/' + listId + '/recipients/' + contactID,
						body: customFields
					});
					sg.API(request, function(error, response) {
				    	console.log(response.statusCode);
				    	console.log(response.body);
				    	console.log(response.headers);

						callback();
					});
				} else {
					callback();
				}
			});
		} else {
			callback();
		}
	});

}

function checkAndAddCustomFields(submittedFields, callback) {
	var request = sg.emptyRequest({
		method: 'GET',
		path: '/v3/contactdb/custom_fields',
	});

	sg.API(request, function(error, response) {
    	console.log(response.statusCode);
    	console.log(response.body);
    	console.log(response.headers);

    	var existingCustomFields = JSON.parse(response.body);
		var fieldsToCreate = [];

		submittedFields.map((submittedField) => {
			var fieldExists = false;
			existingCustomFields.custom_fields.map((field) => {
				if (submittedField == field.name) {
					fieldExists = true;
				}
			});
			if (!fieldExists) {
				fieldsToCreate.push(submittedField);
			}
		});

		if (fieldsToCreate.length == 0) {
			callback();
		} else {
			fieldsToCreate.map((fieldsToCreate) => {
				var body = { name: fieldsToCreate, type: 'text' };

				var request = sg.emptyRequest({
					method: 'POST',
					path: '/v3/contactdb/custom_fields',
					body: body
				});

				sg.API(request, function(error, response) {
			    	callback();
			    });
			});
		}

    });
}

function formatUrl(url) {
	if (url.substr(-1) == '/') {
		return url.substring(0, url.length - 1);
	}
	return url;
}

function stringInArray(string, array) {
	var isInArray = false;
	array.map((item) => {
		if (string == item) {
			isInArray = true;
		}
	});
	return isInArray;
}
