#!/usr/bin/env node
'use strict';
// Usage
//node testProperty.js --discoveryUrl 'https://ankmuley-discovery.dev.ciscoccservice.com' --orgId '4f9178e2-8b6f-4db3-a00f-a723c3b709e9' --propertyName 'feature' --propertyValue 'hi, hello' --kms

var property = require("../index.js").Property,
	chalk = require("chalk"),
	argv = require('minimist')(process.argv.slice(2));

if(argv.help ){
	console.log(chalk.yellow("Usage: updateProperty [--discoveryUrl] [--orgId] [--propertyName] [--propertyValue] [--kms] "));
	return;
}

var kmsScopes = argv.kms || argv.kms === 'true';

property.updateProperty(argv.discoveryUrl, argv.orgId, argv.propertyName, argv.propertyValue, kmsScopes)
.then(function(token){
	console.log(chalk.gray("************************ ACCESS TOKEN ************************"));
	console.log(chalk.green(token))
	console.log(chalk.gray("**************************************************************"));
})
.catch(function(e){
	//console.error("Cannot get token for user : ", || "TEST USER"," for org :",argv.orgid||"TEST ORG");
	console.error("Error occured", e);

});
