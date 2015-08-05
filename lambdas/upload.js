var inspect = require('util').inspect
  , fs      = require('fs')
  , aws     = require('aws-sdk')
  , spawn   = require('child_process').spawn
  , lambda  = new aws.Lambda({apiVersion: '2015-03-31', region:'eu-west-1'})
  , config  = require('./lib/utils').config
  ;
var cmdargs = process.argv.slice(2);
var functionName = cmdargs[0];

if (undefined === functionName) {
	console.log("Usage : node upload functionName");
	return -1;
}

var functionName = "robomeet-" + cmdargs[0];
var functionFile = functionName + '.js';
var functionHandler = functionName + '.handler';
var functionZipFile = functionName + '.zip';
var urlPath = cmdargs[0];

if (!fs.existsSync(functionFile)){
	console.log('Error: unable to find file: '+functionFile);
	return -1;
}

var zip = spawn('zip', [functionZipFile, '-r', functionFile, 'lib/', 'node_modules/']);

zip.on('close', function (code) {
	if (code==0) {
		lambda.getFunction({FunctionName: functionName}, function(getErr, getData){
			if (getErr){
				// need to create the function
				console.log('Creating the function');
				var params = {
					Code: { 
						ZipFile: fs.readFileSync(functionZipFile)
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
					ZipFile: fs.readFileSync(functionZipFile)
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