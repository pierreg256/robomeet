var aws = require('aws-sdk')
  , utils = require('./utils')
  , s3 = new aws.S3()
  , csd = new aws.CloudSearchDomain({
  		region: 'eu-west-1',
		endpoint: 'doc-skin-of-sorrow-44fz4hrlhyf2mrxg6ufx77n35q.eu-west-1.cloudsearch.amazonaws.com'
	})
  , DOC = require("dynamodb-doc")
  , dynamo = new aws.DynamoDB({region:'eu-west-1'})
  , docClient = new DOC.DynamoDB(dynamo)
  , inspect = require('util').inspect
  ;

  var credentialsSuffix = '/credentials.json'
    , profileSuffix = '/profile.json'
    , messagesSuffix = '/inbox/';

  exports.create = function(username, password, callBack){
	  var params = {
	    Bucket: utils.config.users_bucket, /* required */
	    Key: username+credentialsSuffix, /* required */
	    Body: JSON.stringify({login:username, password:password}),
	    ContentType: 'application/json',
	    StorageClass: 'REDUCED_REDUNDANCY'
	  };
	  s3.putObject(params, function(err, data) {
	    if (err) {
	        console.log(err, err.stack); // an error occurred
	        callBack("Unable to create profile for user: "+username);
	    }  else {
	        callBack(null,data);           // successful response
	    }
	  });
  };

exports.getConversation = function(from, to, callBack){

};

exports.sendMessage = function(from, rcptTo, timestamp, message, callBack) {
	from = from.toString().toLowerCase();
	rcptTo = rcptTo.toString().toLowerCase();
	var conversationId = (from<rcptTo?from+'+'+rcptTo:rcptTo+'+'+from);	
	message.conversationId = conversationId;
	message.timestamp = timestamp
	var params = {
		TableName : utils.config.messages_table,
		Item: message
	};
	docClient.putItem(params, function(err, data){
		if (err){
			console.log(err)
			callBack("Unable to save message in conversation: "+conversationId);
		} else {
			callBack(null, data);
		}
	});
};

exports.createProfile = function(username, record, callBack) {
	var params = {
		Bucket: utils.config.users_bucket, 
		Key: username+profileSuffix, /* required */
		Body: JSON.stringify(record),
	    ContentType: 'application/json',
		StorageClass: 'REDUCED_REDUNDANCY',
	};
	s3.putObject(params, function(err, data) {
	if (err) {
	  console.log(err, err.stack); // an error occurred
	  callBack(err);
	} else {
	  callBack();
	}
	});
};

exports.getProfile = function(username, callBack) {
	var params = {
		Bucket: utils.config.users_bucket, 
		Key: username+profileSuffix
	};
	s3.getObject(params, function(err, data) {
		if (err) {
		  console.log(err, err.stack); // an error occurred
		  callBack(err);
		} else {
			var result = JSON.parse(data.Body.toString('utf8'));
			delete result.uid;
			delete result.signature;
			delete result.timestamp;
			delete result.toto;
		  	callBack(null, result);
		}
	});
};

exports.scanProfile = function(profile, callBack) {
    var birth_elts = profile.Birthday.split('/')
    var record = {};
    record.type= "add";
	record.id= profile.EmailAddress;
	record.fields = {
		birthday : profile.Birthday, //new Date(birth_elts[2], birth_elts[0], birth_elts[1]),
		city : profile.City,
		country : profile.CountryFull,
		email : profile.EmailAddress,
		firstname : profile.GivenName,
		gender : profile.Gender,
		height : Number(profile.Centimeters),
		lastname : profile.Surname,
		location : profile.Latitude+', '+profile.Longitude,
		streetaddress : profile.StreetAddress,
		weight : Number(profile.Kilograms),
		zipcode : profile.ZipCode
	}
	var params = {
    	contentType: 'application/json', // required
	    documents: JSON.stringify([record]) // required
	};
	csd.uploadDocuments(params, function(err, data) {
    	if (err) {
    		console.log(err, err.stack);
			callBack(err);
		} else {
        	callBack(null, "Successfully sent 1 document");
		}
	});
}


exports.getCredentials = function(login, callBack) {
  var key      = login+'/credentials.json',
      getParms = {Bucket: utils.config.users_bucket, Key: key};

  s3.getObject(getParms, function(getObjectErr, getObjectData){
    if (getObjectErr) {
      console.log('[ERROR] - S3: error getting object ' + key + ' from bucket ' + utils.config.users_bucket);
      callBack(getObjectErr);
    } else {
      callBack(null, JSON.parse(getObjectData.Body));
    }
  });
};


