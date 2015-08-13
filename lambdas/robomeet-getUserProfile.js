console.log('Loading function');
var aws = require('aws-sdk')
  , utils = require('./lib/utils')
  , users = require('./lib/users')
  , devices = require('./lib/devices')
  , inspect = require('util').inspect;

var isSignatureValid = function(uid, timestamp, password, signature){
  var strToSign = uid+timestamp;
  var verif = utils.signSrting(strToSign, password);
  return (verif==signature);
};

exports.handler = function(event, context) {
	console.log('Received event:', JSON.stringify(event, null, 2));
	if (undefined===event.uid){
		context.fail("Invalid UID");
	} else {
		devices.getCredentials(event.uid, function(credErr, credData){
			if (credErr) {
				context.fail("Unable to retrieve session for uid: "+event.uid);
			} else {
					if ((credData) && (credData.key)){
					key = credData.key;
					if (isSignatureValid(event.uid, event.timestamp, key, event.signature)) {
						console.log("Signature is valid");
						users.getProfile(credData.username, function(profileErr, profileData){
							if (profileErr) {
								context.fail("Unable to fetch profile for user: "+credData.username);
							} else{
								context.succeed(profileData);
							};
						});
					} else{
						context.fail("Invalid signature: "+event.signature);
					};
				} else{
					context.fail("Invalid UID: "+event.uid);					
				};
			}
		});
	}
};