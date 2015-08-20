console.log('Loading function');
var aws = require('aws-sdk')
  , utils = require('./lib/utils')
  , users = require('./lib/users')
  , devices = require('./lib/devices')
  , inspect = require('util').inspect;



var isSignatureValid = function(uid, from, timestamp, password, signature){
  var strToSign = uid+from+timestamp;
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
      checkParameter(event.from) 
    ))
    context.fail("Missing parameters");
  else {
    if (utils.isTimeStampValid(event.timestamp)){
      devices.getCredentials (event.uid, function(credErr, credData){
        if (credErr){
          context.fail("Invalid UID");
        } else {
          users.getCredentials(event.from, function(rcptErr, rcptData){
            if (rcptErr){
              context.fail("Unknown message sender");
            } else {
              if (isSignatureValid(event.uid, event.from, event.timestamp, credData.key, event.signature)) {
                users.conversation(from, to, function(conversationErr, conversationData){
                  if (conversationErr) {
                    context.fail("Impossible to get messages");
                  } else{
                    context.succeed(conversationData);
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

