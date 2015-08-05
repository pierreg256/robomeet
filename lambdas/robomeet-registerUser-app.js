var lambda = require('./robomeet-registerUser')
  , util = require('util');

var context = {};

context.done = function(err, message) {
    if (err)
        console.log(message);
    else
        console.log('finished')
}

var event = {
	username: "test@domaine.com",
	password: "mypassword",
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
