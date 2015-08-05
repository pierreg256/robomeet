var crypto = require('crypto')
    ;

exports.isTimeStampValid = function(timestamp) {
    var now = (new Date()).getTime();
    var prior = now - 15*60*1000;
    var after = now + 15*60*1000;
    var call = (new Date(timestamp)).getTime();

    return ((prior<call)&&(call<after));
};

exports.signSrting = function(strToSign, password) {
	console.log("Signing: "+strToSign+" - with password: "+password);
    var mac = crypto.createHmac('sha256', password);
    
    mac.update(strToSign);
    sig = mac.digest('hex');
    
    return (sig);
}

exports.config = {
	users_bucket : 'robomeet',
	devices_table : 'robomeet_devices',
	lambda_exec_role : "arn:aws:iam::530131689009:role/robomeet_lambda_execution_role",
	lambda_invoke_role : ""
}
