console.log('Loading function');
var aws = require('aws-sdk')
  , utils = require('./lib/utils')
  , users = require('./lib/users')
  , devices = require('./lib/devices')
  , inspect = require('util').inspect;

exports.handler = function(event, context) {
	console.log('Received event:', JSON.stringify(event, null, 2));
	if (undefined===event.uid){
		context.fail("Invalid UID");
	} else {
		devices.getCredentials(event.uid, function(credErr, credData){
			if (credErr) {
				context.fail("Unable to retrieve session for uid: "+event.uid);
			} else {
				users.createProfile(credData.username, event, function(profileErr, profileData){
					if (profileErr){
						context.fail("Unable to store profile for uid: "+event.uid);
					} else {
						users.scanProfile(event, function(scanErr, scanData){
							if (scanErr){
								context.fail("Unable to scan profile");
							} else {
								context.succeed()
							}
						});
					}
				});
			}
		});
	}
};