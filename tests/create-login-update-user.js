var https = require('https')
  , crypto = require('crypto')
  , inspect = require('util').inspect
  ;


var HOST = "isrfkp4qek.execute-api.eu-west-1.amazonaws.com";
var USERNAME = "pgilot@amzon.fr"
  , PASSWORD = "password"
  , now = new Date()
  , uid = crypto.randomBytes(16).toString('hex')
  ;


var createUser = function(callBack){
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
            if (response.statusCode==200) callBack()
                else callBack(body);
        });
    });
    req.end();
};


var loginUser = function(callBack){
    var mac = crypto.createHmac('sha256', PASSWORD);
    var now = new Date();
    mac.update(USERNAME+uid+now.toISOString());
    var signature = mac.digest('hex');

    var loginReq = https.request({
        method: 'GET',
        host: HOST,
        path: '/V1/login?uid='+uid+'&username='+encodeURIComponent(USERNAME)+'&timestamp='+encodeURIComponent(now.toISOString())+'&signature='+signature
    }, function(loginResponse){
        console.log("login user status code: ", loginResponse.statusCode);
        var body="";
        loginResponse.on('data', function(d) {
            body += d;
        });
        loginResponse.on('end', function() {
            //console.log(body);
            if (loginResponse.statusCode==200){
                var key = body.key;
                callBack(null, key);
            } else {
                callBack("Unable to login");
            }
        });
    });
    loginReq.end();
};

var updateProfile = function(callBack){
    var monbody = {
        Gender : "male",
        GivenName : "Pierre",
        Surname : "Gilot",
        StreetAddress : "67, bld du Gal Leclerc",
        City : "Clichy",
        ZipCode : "92110",
        CountryFull : "France",
        EmailAddress : "pgilot@amazon.fr",
        Password : "profile.Password",
        Birthday : "profile.Birthday",
        Kilograms : "profile.Kilograms",
        Centimeters : "profile.Centimeters",
        Latitude : "profile.Latitude",
        Longitude : "profile.Longitude" 
    };
    var now = new Date();
    var signature = "fakesignature"

    var profileReq = https.request({
        method: 'POST',
        host: HOST,
        path: '/V1/profiles?uid='+uid+'&timestamp='+encodeURIComponent(now.toISOString())+'&signature='+signature,
        headers: {
            'Content-Type': 'application/json'
        },
        keepAlive: false

    }, function(profileResponse){
        console.log("user profile status code: ", profileResponse.statusCode);
        var body="";
            if (profileResponse.statusCode==204) {
                callBack(null, inspect(profileResponse.headers,{colors:true}));
            } else{
                callBack("Unable to update profile");
            };
    });
    profileReq.write(JSON.stringify(monbody));
    profileReq.end();
};

createUser(function(err){
    if (err)
        console.log(err);
    else
        loginUser(function(loginErr, loginData){
            if (loginErr)
                console.log(loginErr);
            else
                updateProfile(function(profileErr, profileData){
                    if (profileErr) {
                        console.log(profileErr);
                    } else{
                        console.log(profileData);
                    };
                });
        });
});


/*
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
                    if (loginResponse.statusCode==200){
                        var key = body.key;
                        //////
                        var profileReq = https.request({
                            method: 'POST',
                            host: HOST,
                            path: '/V1/profiles?uid='+uid+'&timestamp='+encodeURIComponent(now.toISOString())+'&signature='+signature,
                            headers: {
                                'Content-Type': 'application/json'
                                //,'Content-Encoding': 'utf8'
                                //,'Content-Length': postData.length
                            }

                        }, function(profileResponse){
                            console.log(inspect(profileReq,{colors:true}));
                            console.log("user profile status code: ", profileResponse.statusCode);
                            body="";
                            profileResponse.on('data', function(d) {
                                body += d;
                            });
                            profileResponse.on('end', function() {
                                console.log(body);
                            });
                        });
                        var monbody = {
                            Gender : "male",
                            GivenName : "Pierre",
                            Surname : "Gilot",
                            StreetAddress : "67, bld du Gal Leclerc",
                            City : "Clichy",
                            ZipCode : "92110",
                            CountryFull : "France",
                            EmailAddress : "pgilot@amazon.fr",
                            Password : "profile.Password",
                            Birthday : "profile.Birthday",
                            Kilograms : "profile.Kilograms",
                            Centimeters : "profile.Centimeters",
                            Latitude : "profile.Latitude",
                            Longitude : "profile.Longitude" 
                        };

                        profileReq.write(JSON.stringify(monbody));
                        profileReq.end();

                        //////
                    }
                });
            });
            loginReq.end();
        }
    });
	console.log("create user statusCode: ", response.statusCode);

    // Continuously update stream with data
});

req.end();


*/