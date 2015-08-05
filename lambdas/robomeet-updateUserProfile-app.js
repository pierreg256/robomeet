var lambda = require('./robomeet-updateUserProfile')
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
	uid: "abc123",
	timestamp: now.toISOString()
};

var mac = crypto.createHmac('sha256', "mypassword");

mac.update(event.uid+event.timestamp);
event.signature = mac.digest('hex');


context.succeed = function(data) {
    console.log("Success!");
    console.log(util.inspect(data,{colors:true}));
}

context.fail = function(err) {
  console.log('Error!');
    console.log(util.inspect(err, {colors:true}));
}

lambda.handler(event, context);