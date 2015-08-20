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
      checkParameter(event.recipient) &&
      checkParameter(event.message) 
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
                users.sendMessage(credData.username, event.recipient, event.timestamp, event.message, function(sendErr){
                  if (sendErr) {
                    context.fail("Impossible to send message");
                  } else{
                    context.succeed();
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

/* inspirational
      users.getCredentials(event.username, function(userErr, userData){
        if (userErr) {
          context.fail("Invalid User: "+event.username);
        } else {
          console.log(inspect(userData, {colors:true}));
          if (isSignatureValid(event.username, event.uid, event.timestamp, userData.password, event.signature)) {
            devices.registerDevice(event.uid, event.username, function(deviceErr, deviceData){
              if (deviceErr){
                context.fail("Unable to register device: "+event.uid);
              } else {
                context.succeed({key: deviceData});
              }
            });
          } else {
            context.fail("Signature is invalid : "+event.signature);
          }
        }
      });
*/