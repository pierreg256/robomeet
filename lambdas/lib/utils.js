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
    region: 'eu-west-1',
	users_bucket : 'robomeet',
    devices_table : 'robomeet_devices',
    messages_table : 'robomeet_conversations',
	lambda_exec_role : "arn:aws:iam::530131689009:role/robomeet_lambda_execution_role",
	lambda_invoke_role : "",
    developer_provider_name : "login.pgt.com",
    identity_pool_id : "eu-west-1:a1c57c1c-17c6-43ab-9e6d-995c01e78f66",
    search_endpoint : "search-skin-of-sorrow-44fz4hrlhyf2mrxg6ufx77n35q.eu-west-1.cloudsearch.amazonaws.com"
}
