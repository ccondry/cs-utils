#!/usr/bin/env node
'use strict';
var auth = require("../index.js").Auth,
	chalk = require("chalk"),
	argv = require('minimist')(process.argv.slice(2)),
	hoodieOrg =require("../config/hoodie_org.json");

if(argv.help ){
	console.log(chalk.yellow("Usage: cs-user-token [--user] [--password] [--orgid][--help]"));
	return;
}
var SCOPE = "contact-center-context:pod_write contact-center-context:pod_read webex-squared:kms_read webex-squared:kms_bind webex-squared:kms_write spark:kms";

var user = argv.user || hoodieOrg.users[1].userName,
	password = argv.password || hoodieOrg.users[1].password,
	orgId = argv.orgid || hoodieOrg.orgId;
auth.getOrgAdminToken(user,password,orgId,SCOPE)
.then(function(token){
	console.log(chalk.gray("************************ ACCESS TOKEN ************************"));
	console.log(chalk.green(token.access_token))
	console.log(chalk.gray("**************************************************************"));
	console.log(chalk.italic("CLIENT ID:"),chalk.cyan(auth.USER_CLIENT_ID));
	console.log(chalk.italic("CLIENT SECRET:"),chalk.cyan(auth.USER_CLIENT_SECRET));
})
.catch(function(e){
	console.error("Cannot get token for user : ",user," for org :",orgId);
	console.error("Error occured",e.data? e.data.error: e);
});
