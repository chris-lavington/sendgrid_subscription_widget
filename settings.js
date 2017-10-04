// Change the url to the domain of your app
exports.url = 'https://git.heroku.com/somersetwood-splash-signup.git';

exports.senderEmail = "chris.lavington@gmail.com";
exports.senderName = "Chris Lavington";

// set 'exports.listId = null' to add contact to all contacts, but no specific list
// or a string with the listId to add to a specific list
exports.listId = null;

// set 'exports.templateId = null' to opt out of using a template
// or a string with the templateId to use a template
exports.templateId = "de38eff7-80cb-4ad6-b60b-fa8a8d6b50f2";

// receive an email when a new signup is confirmed
exports.sendNotification = true;
exports.notificationEmail = "chris.lavington@gmail.com";
