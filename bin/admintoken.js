#!/usr/bin/env node
'use strict';
var auth = require("../index.js").Auth,
	chalk = require("chalk"),
	argv = require('minimist')(process.argv.slice(2));

if(argv.help ){
	console.log(chalk.yellow("Usage: cs-token [--user] [--password] [--orgid] [--scopes] [--help]"));
	return;
}

auth.getOrgAdminToken(argv.user,argv.password,argv.orgid,argv.scopes)
.then(function(token){
	console.log(chalk.gray("************************ ACCESS TOKEN ************************"));
	console.log(chalk.green(token.access_token))
	console.log(chalk.gray("**************************************************************"));
})
.catch(function(e){
	console.error("Cannot get org admin token for user : ",argv.user," for org :",argv.orgid);
	console.error("Error occured",e.data? e.data.error: e);
});
