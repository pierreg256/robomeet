var fs = require('fs')
  , util = require('util')
  , https = require('https')
  , crypto = require('crypto')
  , inspect = require('util').inspect
  , events = require('events')
  , emitter = new events.EventEmitter()
  , spawn   = require('child_process').spawn
  , remaining = ''
  ;


var HOST = "isrfkp4qek.execute-api.eu-west-1.amazonaws.com"
  , uid = crypto.randomBytes(16).toString('hex')
  ;


var createUser = function(user, callBack){
	var now = new Date();
	var url = 'https://'+HOST+'/V1/register?username='+encodeURIComponent(user.EmailAddress)+'&password='+encodeURIComponent(user.Password)+'&timestamp='+encodeURIComponent(now.toISOString());
	var curl = spawn('curl', ['-i', url]);
	var response = ''
	curl.stdout.on('data', function(d){
		response+=d;
	});
	curl.on('close', function(code){
		if ((code == 0)||(code == 3))
			{
				headers = response.split('\n');
				console.log('create users: '+headers[0]);
				code = headers[0].split(' ')[1];
				if (code >204){
					callBack(response);
				} else 
					callBack()
			}
		else
			{
				console.log('ERROR|CreateUser|curl code:'+code);
				callBack(code);
			}
	});
/*    var req = https.request({
        method: 'GET',
        host: HOST,
        path: '/V1/register?username='+encodeURIComponent(user.EmailAddress)+'&password='+encodeURIComponent(user.Password)+'&timestamp='+encodeURIComponent(now.toISOString())
    }, function(response) {
        console.log("user create status code: ", response.statusCode);

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
*/
};


var loginUser = function(user, callBack){
    var mac = crypto.createHmac('sha256', user.Password);
    var now = new Date();
    mac.update(user.EmailAddress+uid+now.toISOString());
    var signature = mac.digest('hex');
	var url = 'https://'+HOST+'/V1/login?uid='+uid+'&username='+encodeURIComponent(user.EmailAddress)+'&timestamp='+encodeURIComponent(now.toISOString())+'&signature='+signature;
	var curl = spawn('curl', ['-i', url]);
	var response = '';
	//console.log(url);
	curl.stdout.on('data', function(d){
		response+=d;
	});
	curl.on('close', function(code){
		if ((code == 0)||(code == 3))
			{
				headers = response.split('\n');
				console.log('Login users: '+headers[0]);
				code = headers[0].split(' ')[1];
				if (code >204){
					callBack(response);
				} else 
					callBack()
			}
		else
			{
				console.log('ERROR|CreateUser|curl code:'+code);
				callBack(code);
			}
	});

/*    var loginReq = https.request({
        method: 'GET',
        host: HOST,
        path: '/V1/login?uid='+uid+'&username='+encodeURIComponent(user.EmailAddress)+'&timestamp='+encodeURIComponent(now.toISOString())+'&signature='+signature
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
            	console.log(inspect(body,{colors:true}));
                callBack("Unable to login");
            }
        });
    });
    console.log('https://'+HOST+loginReq.path);
    loginReq.end();
*/
};

var updateProfile = function(user, callBack){
    var now = new Date();
    var signature = "fakesignature"

	var url = 'https://'+HOST+'/V1/profiles?uid='+uid+'&timestamp='+encodeURIComponent(now.toISOString())+'&signature='+signature;
	var curl = spawn('curl', ['-i', url, '-H', 'Content-Type: application/json', '-X', 'POST', '--data-binary', JSON.stringify(user)]);
	var response = '';
	curl.stdout.on('data', function(d){
		response+=d;
	});
	curl.on('close', function(code){
		if ((code == 0)||(code == 3))
			{
				headers = response.split('\n');
				console.log('Update users profile: '+headers[0]);
				code = headers[0].split(' ')[1];
				if (code >204){
					console.log(response);
					callBack(response);
				} else
					callBack();
			}
		else
			{
				console.log('ERROR|CreateUser|curl code:'+code);
				callBack(code);
			}
	});
/*
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
        var body="";
        profileResponse.on('data', function(d) {
            body += d;
        });
        profileResponse.on('end', function(d) {
            console.log(inspect(body,{colors:true}));
        });
            if (profileResponse.statusCode==204) {
                callBack(null, inspect(profileResponse.headers,{colors:true}));
            } else{
                callBack("Unable to update profile");
            };
    });
    profileReq.write(JSON.stringify(user));
    profileReq.end();
    */
};





//emitter.on('lineReady', function(line){
	//process.stdout.write(line);
var handler = function(line, callBack){
	line = line.replace('\r','');

	if (line.charAt(0)=='G')
		return;

	var items = line.split('|');
	var profile = {};

	profile.Gender = items[0];
	profile.GivenName = items[1];
	profile.Surname = items[2];
	profile.StreetAddress = items[3];
	profile.City = items[4];
	profile.ZipCode = items[5];
	profile.CountryFull = items[6];
	profile.EmailAddress = items[7].toLowerCase();
	profile.Password = items[8];
	profile.Birthday = items[9];
	profile.Kilograms = items[10];
	profile.Centimeters = items[11];
	profile.Latitude = items[12];
	profile.Longitude = items[13];

	//process.stdout.write(util.inspect(profile)+'\n');


	createUser(profile, function(err){
	    if (err) {
	        console.log(err);
	        callBack(err);
	    }
	    else
	        loginUser(profile, function(loginErr, loginData){
	            if (loginErr) {
	                console.log(loginErr);
	                callBack(err);
	            }
	            else
	                updateProfile(profile, function(profileErr, profileData){
	                    if (profileErr) {
	                        console.log(profileErr);
	                        callBack(profileErr);
	                    } else{
	                        console.log("success!");
	                        callBack();
	                    };
	                });
	        });
	});

};


// fires on every block of data read from stdin
/*
process.stdin.on('data', function(chunk) {
	var capture = chunk.split('\n');

	for (var i=0;i<capture.length; i++) {
		if (i==0) {
			emitter.emit('lineReady',remaining + capture[i]);
		} else if (i<capture.length-1) {
			emitter.emit('lineReady',capture[i]);
		} else {
			remaining = capture[i];
		}
	}
});

// fires when stdin is completed being read
process.stdin.on('end', function() {
	emitter.emit('dataReady');
});

// set up the encoding for STDIN
process.stdin.setEncoding('utf8');

// resume STDIN - paused by default
process.stdin.resume();
*/
var lines=[];
var index = 1;

var func = function(callBack){
	console.log(lines[index]);
	handler(lines[index], function(err, data){
		if (err) {
			console.log(err);
			callBack(err);
		}
		else{
			index++;
			if (index>lines.length) {
				callBack();
			} else {
				func(callBack)
			}
		}
	});
}

fs.readFile('./users.txt', {encoding:'utf8'}, function (err, data) {
  if (err) throw err;
  else {
	  lines = data.split('\n');
	  console.log(lines.length);
	  var index = 1;
	  func(function(err, data){
	  	if (err) {console.log('error occurred')} else{console.log('total success')};
	  });
  }
});