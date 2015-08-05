var lambda = require('./robomeet-hello')
  , util = require('util');

var context = {};

context.done = function(err, message) {
    if (err)
        console.log(message);
    else
        console.log('finished')
}

var event = {
	username: "pierre",
	password: "pwd",
	timestamp: new Date()
}

context.succeed = function() {
    console.log("Success!");
}

context.fail = function(err) {
  console.log('Error!');
    console.log(util.inspect(err, {colors:true}));
}

lambda.handler(event, context);