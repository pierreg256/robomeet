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
	timestamp: now.toISOString(),
  Gender : "male",
  GivenName : "Pierre",
  Surname : "Gilot",
  StreetAddress : "67, bld du Gal Leclerc",
  City : "Clichy",
  ZipCode : "92110",
  CountryFull : "France",
  EmailAddress : "pgilot@amazon.fr",
  Birthday : "12/01/1971",
  Kilograms : "80",
  Centimeters : "180",
  Latitude : "0",
  Longitude : "0" 
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