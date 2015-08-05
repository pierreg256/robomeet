var https = require('https')
  , crypto = require('crypto')
  ;


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

    var body = '';
    response.on('error', function(e){
        console.log(e.message, e.stack);

    });
    response.on('data', function(d) {
        body += d;
    });
    response.on('end', function() {

        // Data reception is done, do whatever with it!
        //console.log(body);
        if (response.statusCode == 200)  {
            // login user
            var uid = crypto.randomBytes(16).toString('hex');
            var mac = crypto.createHmac('sha256', PASSWORD);
            mac.update(USERNAME+uid+now.toISOString());
            var signature = mac.digest('hex');

            var loginReq = https.request({
                method: 'GET',
                host: HOST,
                path: '/V1/login?uid='+uid+'&username='+encodeURIComponent(USERNAME)+'&timestamp='+encodeURIComponent(now.toISOString())+'&signature='+signature
            }, function(loginResponse){
                console.log("login user status code: ", loginResponse.statusCode);
                body="";
                loginResponse.on('data', function(d) {
                    body += d;
                });
                loginResponse.on('end', function() {
                    console.log(body);
                });
            });
            loginReq.end();
        }
    });
	console.log("create user statusCode: ", response.statusCode);

    // Continuously update stream with data
});

req.end();


