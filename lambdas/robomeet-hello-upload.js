var fs = require('fs')
  , aws = require('aws-sdk')
  , spawn = require('child_process').spawn
  , lambda = new aws.Lambda({apiVersion: '2015-03-31', region:'eu-west-1'})
  , config = require('./lib/utils').config
  , inspect = require('util').inspect
  ;

var functionName = "robomeet-hello";
var functionHandler = functionName + '.handler';
var urlPath = "hello";

var zip = spawn('zip', ['robomeet-hello.zip', '-r', 'robomeet-hello.js', 'lib/', 'node_modules/']);

zip.on('close', function (code) {
	if (code==0) {
		lambda.getFunction({FunctionName: functionName}, function(getErr, getData){
			if (getErr){
				// need to create the function
				console.log('Creating the function');
				var params = {
					Code: { 
						ZipFile: fs.readFileSync('robomeet-hello.zip')
					},
					FunctionName: functionName, 
					Handler: functionHandler,
					Role: config.lambda_exec_role,
					Runtime: 'nodejs',
					Description: 'lorem ipsum dolor sit amet',
					MemorySize: 128,
					Timeout: 3
				};
				console.log(inspect(lambda,{colors:true, depth:6}));
				lambda.createFunction(params, function(err, data) {
					if (err) console.log(err, err.stack); // an error occurred
					else {
						var params = {
							Action: 'lambda:InvokeFunction', /* required */
							FunctionName: functionName, /* required */
							Principal: 'apigateway.amazonaws.com', /* required */
							StatementId: functionName+'-invoke', /* required */
							SourceArn: 'arn:aws:execute-api:eu-west-1:530131689009:1a7k9egipi/*/GET/'+urlPath
						};
						lambda.addPermission(params, function(err, data) {
							if (err) console.log(err, err.stack); // an error occurred
							else     console.log(data);           // successful response
						});
					}     
				});
			} else {
				// need to update the function
				console.log('Updating the function');
				var params = {
					FunctionName: functionName, /* required */
					ZipFile: fs.readFileSync('robomeet-hello.zip')
				};
				lambda.updateFunctionCode(params, function(err, data) {
					if (err) console.log(err, err.stack); // an error occurred
					else     console.log(data);           // successful response
				});
			}
		});
	} else
  		console.log('child process exited with code ' + code);
});