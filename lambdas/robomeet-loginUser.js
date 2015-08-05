console.log('Loading function');
var aws = require('aws-sdk')
  , utils = require('./lib/utils')
  , users = require('./lib/users')
  , devices = require('./lib/devices')
  , inspect = require('util').inspect;



var isSignatureValid = function(username, uid, timestamp, password, signature){
  var strToSign = username+uid+timestamp;
  var verif = utils.signSrting(strToSign, password);
  return (verif==signature);
};

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

  if (utils.isTimeStampValid(event.timestamp)){
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
  } else {
      context.fail("Invalid stimestamp");
  }
//    validateLoginRequest(event.username, event.uid, event.signature, event.timestamp, context);

};