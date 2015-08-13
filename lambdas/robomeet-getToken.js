console.log('Loading function');
var aws = require('aws-sdk')
  , utils = require('./lib/utils')
  , users = require('./lib/users')
  , devices = require('./lib/devices')
  , inspect = require('util').inspect
  , cognitoidentity = new aws.CognitoIdentity({"region": 'eu-west-1'})
  ;



var isSignatureValid = function(username, uid, timestamp, password, signature){
  var strToSign = username+uid+timestamp;
  var verif = utils.signSrting(strToSign, password);
  return (verif==signature);
};

getToken = function(logins, identityId, callBack){
    var params = {
        IdentityPoolId: utils.config.identity_pool_id,
        Logins: logins,
        TokenDuration: 15 * 60 
    };
    if ((identityId) && (identityId!==''))
        params.IdentityId = identityId;
        
    cognitoidentity.getOpenIdTokenForDeveloperIdentity(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            callBack(err); // an error occurred
        } else {
            console.log(data);           // successful response
            callBack(null, data);
        }
    });
};

exports.handler = function(event, context) {
  console.log('Received event:', JSON.stringify(event, null, 2));
  if ((event.uid==='')||(event.timestamp==='')||(event.signature==='')){
      context.fail("Missing parameters");
  } else {
    event.identityId = event.identityId || '';
    if (utils.isTimeStampValid(event.timestamp)){
      // Get device info
      devices.getCredentials(event.uid, function(deviceErr, deviceData){
        if (deviceErr){
          context.fail("Unathorized device : "+uid);
        } else {
          var username = deviceData.username;
          users.getCredentials(username, function(userErr, userData){
            if (userErr){
              context.fail("Unable to find user: "+username);
            } else {
              if (username != event.logins[utils.config.developer_provider_name]) {
                context.fail("User mismatch for device and logins map");
              } else{
                getToken(event.logins, event.identityId, function(tokenErr, tokenData){
                  if (tokenErr) {
                    context.fail("Unable to generate token");
                  } else{
                    context.succeed({identityPoolId:utils.config.identity_pool_id, identityId:tokenData.IdentityId, token:tokenData.Token}); 
                  };
                });
              };
            }
          });
        }
      });
    } else {
      context.fail("Invalid stimestamp");
    }
  }
};