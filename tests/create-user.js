var https = require('https');


var HOST = "isrfkp4qek.execute-api.eu-west-1.amazonaws.com";
var USERNAME = "pgilot@amzon.fr"
  , PASSWORD = "password"
  , now = new Date();
  ;

var req = https.request({
	method: 'GET',
    host: HOST,
    path: '/V1/register?username='+encodeURIComponent(USERNAME)+'&password='+encodeURIComponent(PASSWORD)+'&timestamp='+encodeURIComponent(now.toISOString())
}, function(response) {

	console.log("user statusCode: ", response.statusCode);

    // Continuously update stream with data
    var body = '';
    response.on('error', function(e){
    	console.log(e.message, e.stack);

    });
    response.on('data', function(d) {
        body += d;
    });
    response.on('end', function() {

        // Data reception is done, do whatever with it!
        console.log(body);
    	});
	});

req.end();


