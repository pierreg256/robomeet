console.log('Loading function');
var aws = require('aws-sdk')
  , utils = require('./lib/utils')
  , users = require('./lib/users')
  , devices = require('./lib/devices')
  , inspect = require('util').inspect;



var isSignatureValid = function(uid, recipient, timestamp, password, signature){
  var strToSign = uid+recipient+timestamp;
  var verif = utils.signSrting(strToSign, password);
  return (verif==signature);
};

var checkParameter = function(param) {
  if (param && ((param !== "")||(typeof param === "object")))
    return true;
  else
    return false;
}

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));
  if (!(
      checkParameter(event.uid) &&
      checkParameter(event.timestamp) &&
      checkParameter(event.signature) &&
      checkParameter(event.recipient) 
    ))
    context.fail("Missing parameters");
  else {
    if (utils.isTimeStampValid(event.timestamp)){
      devices.getCredentials (event.uid, function(credErr, credData){
        if (credErr){
          context.fail("Invalid UID");
        } else {
          users.getCredentials(event.recipient, function(rcptErr, rcptData){
            if (rcptErr){
              context.fail("Unknown recipient");
            } else {
              if (isSignatureValid(event.uid, rcptData.login, event.timestamp, credData.key, event.signature)) {
                users.getMessages(credData.username, event.recipient, event.timestamp, function(msgErr, msgData){
                  if (msgErr) {
                    context.fail("Impossible to send message");
                  } else{
                    context.succeed(msgData);
                  };
                });
              } else{
                context.fail("Invalid signature");
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

