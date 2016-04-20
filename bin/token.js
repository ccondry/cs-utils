#!/usr/bin/env node
'use strict';
var auth = require("../index.js").Auth,
	chalk = require("chalk"),
	argv = require('minimist')(process.argv.slice(2));

var KMS_SCOPES = 'webex-squared:kms_read webex-squared:kms_bind webex-squared:kms_write spark:kms';

if(argv.help ){
	console.log(chalk.yellow("Usage: cs-token [--user] [--password] [--orgid] [--kms] [--help]"));
	return;
}

var kmsScopes;
if (argv.kms || argv.kms === 'true') {
	kmsScopes = KMS_SCOPES;
} else {
	kmsScopes = null;
}

auth.getToken(argv.user,argv.password,argv.orgid,kmsScopes)
.then(function(token){
	console.log(chalk.gray("************************ ACCESS TOKEN ************************"));
	console.log(chalk.green(token.access_token))
	console.log(chalk.gray("**************************************************************"));
})
.catch(function(e){
	console.error("Cannot get token for user : ",argv.user || "TEST USER"," for org :",argv.orgid||"TEST ORG");
	console.error("Error occured",e.data? e.data.error: e);

});
