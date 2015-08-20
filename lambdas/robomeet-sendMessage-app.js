var login = require('./robomeet-loginUser')
  , match = require('./robomeet-sendMessage')
  , util = require('util')
  , crypto = require('crypto')
  ;

var context = {};

context.done = function(err, message) {
    if (err)
        console.log(message);
    else
        console.log('finished')
}

var now = new Date();
var event = {
	username: "test@domaine.com",
	uid: crypto.randomBytes(16).toString('hex'),
	timestamp: now.toISOString()
};

var mac = crypto.createHmac('sha256', "mypassword");
mac.update(event.username+event.uid+event.timestamp);
event.signature = mac.digest('hex');


context.succeed = function(data) {
    console.log("Success!");
    console.log(util.inspect(data,{colors:true}));

    var event2 = {
      uid:event.uid,
      timestamp:event.timestamp,
      recipient: "pgilot@amazon.fr",
      signature:'fakesignature',
      message:{
        "isMediaMessage":0,
        "senderDisplayName":"Pierre",
        "text":"hi",
        "messageHash":2739302242,
        "senderId":"pgilot@amazon.fr",
        "date":"2015-08-19T15:02:46Z"
      }
    };
var mac = crypto.createHmac('sha256', data.key);
mac.update(event2.uid+event2.recipient+event2.timestamp);
event2.signature = mac.digest('hex');

    var context2 = {};
    context2.succeed = function(successData){
      console.log('success: ' +util.inspect(successData,{colors:true, depth:5}));
    };
    context2.fail=function(successErr){
      console.log("failed: "+successErr);
    }
    match.handler(event2, context2);
}

context.fail = function(err) {
  console.log('Error!');
    console.log(util.inspect(err, {colors:true}));
}

login.handler(event, context);