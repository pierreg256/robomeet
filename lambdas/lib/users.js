var aws = require('aws-sdk')
  , utils = require('./utils')
  , s3 = new aws.S3();

  var credentialsSuffix = '/credentials.json'
    , profileSuffix = '/profile.json';

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


