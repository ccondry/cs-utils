#!/usr/bin/env node
var chalk = require("chalk"),
	fs = require('fs'),
	Promise = require('es6-promise').Promise,
	request = require('request-promise'),
	auth = require("../index.js").Auth,
	argv = require('minimist')(process.argv.slice(2));

if(argv.help ){
	console.log(chalk.yellow("Usage: cs-reset-account --srcfile <json file> [--dstfile <json file>]"));
	return;
}
if(!argv.srcfile ){
	console.log(chalk.red("Please provide user file"));
	console.log(chalk.yellow("Usage: cs-reset-account --srcfile <json file> [--dstfile <json file>]"));
	return;
}

var setPassword  = function(accessToken,orgId,userId,password,counter){
		var promise, CI_MAX_PASSWORD_HISTORY=5;
		counter = counter||0;
		if(counter<CI_MAX_PASSWORD_HISTORY){
			promise= setPassword(accessToken,orgId,userId,password,counter+1);
		}else {
			promise = Promise.resolve();
		};
		return promise.then(function(){
			var url = "https://identity.webex.com/identity/scim/"+orgId+"/v1/Users/" + userId
				headers = {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + accessToken
				},
				newPassword = counter>0 ? password + new Date().getTime(): password,
				args = {
					"schemas": ["urn:scim:schemas:core:1.0", "urn:scim:schemas:extension:cisco:commonidentity:1.0"],
					"password": newPassword
				};
			return request(url,
					{
						method: 'patch',
						headers: headers,
						body: JSON.stringify(args),
					});
		});
	},
	resetAdminAccountPassword = function(accessToken,orgId,accountId,password){
	var headers = {
			'Authorization': 'Bearer ' + accessToken
		}
	return request("https://identity.webex.com/identity/scim/v1/Users/me",{
				method: 'get',
				headers: headers
			}).then(function(userJson){
				var user = JSON.parse(userJson);
				return setPassword(accessToken,orgId,user.id,password);
			});
};

var orgUsers = JSON.parse(fs.readFileSync(argv.srcfile, 'utf8'));
var dstfile = argv.dstfile || argv.srcfile;

auth.getOrgAdminToken(orgUsers.adminUser,orgUsers.adminPassword,orgUsers.orgId,"Identity:SCIM")
.then(function(token){
	return resetAdminAccountPassword(token.access_token,orgUsers.orgId,orgUsers.adminUser,orgUsers.adminPassword);
})
.then(function(resp){
	orgUsers.lastUpdated= new Date();
	fs.writeFile(dstfile, JSON.stringify(orgUsers, null, 2));
	console.log(chalk.green("Admin password reset successfully. Updated file: ") + dstfile);
})
.catch(function(e){
	console.error("Error occured",e.data? e.data.error: e);
});
