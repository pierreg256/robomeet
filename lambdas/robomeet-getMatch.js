console.log('Loading function');
var aws = require('aws-sdk')
  , utils = require('./lib/utils')
  , users = require('./lib/users')
  , devices = require('./lib/devices')
  , inspect = require('util').inspect
  , csd = new aws.CloudSearchDomain({
    region: utils.config.region,
    endpoint: utils.config.search_endpoint
  });
  ;



var isSignatureValid = function(uid, timestamp, password, signature){
  var strToSign = username+uid+timestamp;
  var verif = utils.signSrting(strToSign, password);
  return (verif==signature);
};

getToken = function(logins, identityId, callBack){
    var params = {
        IdentityPoolId: utils.config.identity_pool_id,
        Logins: logins,
        TokenDuration: 15 * 60 
    };
    if ((identityId) && (identityId!==''))
        params.IdentityId = identityId;
        
    cognitoidentity.getOpenIdTokenForDeveloperIdentity(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            callBack(err); // an error occurred
        } else {
            console.log(data);           // successful response
            callBack(null, data);
        }
    });
};

findMatching = function(record, callBack){
    var params = {
        query: "(not email:'"+record.username+"')", /* required */
        expr: "{'distance':'haversin("+record.latitude+","+record.longitude+",location.latitude,location.longitude)','age':'(_time-birthday)/1000/3600/24/365.25'}",
        partial: true,
        queryParser: 'structured',
        return: "firstname,lastname,city,location,distance,gender,birthday,age,_score",
        size: 50,
        sort: 'distance asc',
    };
    console.log(inspect(record, {colors:true}));
    console.log(inspect(params, {colors:true}));
    csd.search(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            callBack("unable to fetch match");
        }
        else {
          console.log("nb hits : ", data.hits.found);
          callBack(null, data.hits.hit);
        }    
    });
};

exports.handler = function(event, context) {
  console.log('Received event:', JSON.stringify(event, null, 2));
  if ((event.uid==='')||(event.timestamp==='')||(event.signature==='')){
      context.fail("Missing parameters");
  } else {
    if (utils.isTimeStampValid(event.timestamp)){
      // Get device info
      devices.getCredentials(event.uid, function(deviceErr, deviceData){
        if (deviceErr){
          context.fail("Unathorized device : "+uid);
        } else {
          var username = deviceData.username;
          users.getCredentials(username, function(userErr, userData){
            if (userErr){
              context.fail("Unable to find user: "+username);
            } else {
              console.log(inspect(deviceData,{colors:true}));
              event.username = deviceData.username;
              findMatching(event, function(matchErr, matchData){
                if (matchErr) {
                  context.fail("Unable to fetch matching users");
                } else{
                  // prepare the results before sending:
                  var result = [];
                  matchData.forEach(function(match){
                    var matchRecord = {
                      Birthday     : match.fields.birthday[0],
                      Centimeters  : undefined,
                      EmailAddress : match.id,
                      Gender       : match.fields.gender[0],
                      GivenName    : match.fields.firstname[0],
                      Kilograms    : undefined,
                      Latitude     : match.fields.location[0].split(',')[0],
                      Longitude    : match.fields.location[0].split(',')[1],
                      Surname      : match.fields.lastname[0],
                      Age          : Math.floor(match.exprs.age),
                      Distance     : match.exprs.distance
                    };
                    result.push(matchRecord);
                  })
                  context.succeed(result);
                };
              })
            }
          });
        }
      });
    } else {
      context.fail("Invalid stimestamp");
    }
  }
};