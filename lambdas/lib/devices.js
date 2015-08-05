var aws = require('aws-sdk')
  , utils = require('./utils')
  , crypto = require('crypto')
  , DOC = require("dynamodb-doc")
  , dynamo = new aws.DynamoDB({region:'eu-west-1'})
  , docClient = new DOC.DynamoDB(dynamo)
  , inspect = require('util').inspect
  ;



exports.registerDevice = function(uid, username, callBack) {
	var key = crypto.randomBytes(16).toString('hex');
	var params = {
		TableName : utils.config.devices_table,
		Item: {
			deviceID: uid,
			username: username,
			key: key
		}
	};
	docClient.putItem(params, function(err, data){
		if (err){
			console.log(err)
			callBack("Unable to register device: "+uid);
		} else {
			callBack(null, key);
		}
	});

};

exports.getCredentials = function(uid, callBack){
	var params = {
		TableName : utils.config.devices_table,
		Key: { deviceID: uid}
	};
	docClient.getItem(params, function(getErr, getData){
		if (getErr){
			console.log(getErr.message, getErr.stack);
			callBack("Unable to fetch device: "+uid);
		} else {
			callBack(null, getData.Item);
		}
	});
}
