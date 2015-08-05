var aws = require('aws-sdk')
    utils = require('./lib/utils')
    users = require('./lib/users');


exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    if (utils.isTimeStampValid(event.timestamp)){
    	users.create(event.login, event.password, function(userErr, userData){
    		if (userErr) {
    			context.fail("Unable to create user");
    		} else {
    			context.succeed();
    		}
    	});
    } else {
    	context.fail("Invalid stimestamp");
    } 
};

