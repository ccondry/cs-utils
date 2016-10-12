#!/usr/bin/env node
var chalk = require("chalk"),
	fs = require('fs'),
	Promise = require('es6-promise').Promise,
	request = require('request-promise'),
	auth = require("../index.js").Auth,
	argv = require('minimist')(process.argv.slice(2));

if(argv.help ){
	console.log(chalk.yellow("Usage: cs-reset-account --srcfile <json file> [--adminrefresh]"));
	return;
}
if(!argv.srcfile ){
	console.log(chalk.red("Please provide user file"));
	console.log(chalk.yellow("Usage: cs-reset-account --srcfile <json file> [--adminrefresh]"));
	return;
}

var generateNewPassword = function(){
	return 'eeFF12$' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
};

var setMachineAccountPassword = function(accessToken,orgId,machineAccountId,newPassword){
	url = "https://identity.webex.com/organization/" + orgId + "/v1/Machines/" + machineAccountId,
	headers = {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + accessToken
	},
	args = { "password": newPassword};
	return request(url, {
		method: 'patch',
		body: JSON.stringify(args),
		headers: headers
	});
};

var setUserPassword  = function(accessToken,orgId,userId,password,counter){
		var promise, CI_MAX_PASSWORD_HISTORY=5;
		counter = counter||0;
		if(counter<CI_MAX_PASSWORD_HISTORY){
			promise= setUserPassword(accessToken,orgId,userId,password,counter+1);
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
	};

var	resetAdminAccountPassword = function(accessToken,orgId,password){
	var headers = {
			'Authorization': 'Bearer ' + accessToken
		}
	return request("https://identity.webex.com/identity/scim/v1/Users/me",{
				method: 'get',
				headers: headers
			}).then(function(userJson){
				var user = JSON.parse(userJson);
				return setUserPassword(accessToken,orgId,user.id,password);
			});
};
var orgUsers = JSON.parse(fs.readFileSync(argv.srcfile, 'utf8'));
var dstfile = argv.srcfile;
console.log(chalk.cyan("Getting access token..."));
auth.getOrgAdminToken(orgUsers.adminUser,orgUsers.adminPassword,orgUsers.orgId,"Identity:Organization Identity:SCIM")
.then(function(token){
	if(orgUsers.machineAccounts && orgUsers.machineAccounts.length>0){
		var allPasswordRequests = [];
		orgUsers.machineAccounts.forEach(function(machineAccount){
			console.log(chalk.cyan("Setting new password for Machine account:"), chalk.bold(machineAccount.name));
			machineAccount.password = generateNewPassword();
			allPasswordRequests.push(
				setMachineAccountPassword(token.access_token,orgUsers.orgId,machineAccount.id,machineAccount.password));
		});
		return Promise.all(allPasswordRequests)
				.then(function(){
					return token.access_token;
				})
	}else {
		return Promise.resolve(token.access_token)
	}

})
.then(function(accessToken){
	if(orgUsers.users && orgUsers.users.length>0){
		var allUserPasswordRequests = [];
		orgUsers.users.forEach(function(user){
			console.log(chalk.cyan("Refreshing password of User:"), chalk.bold(user.userName));
			allUserPasswordRequests.push(
				setUserPassword(accessToken,orgUsers.orgId,user.id,user.password));
		});
		return Promise.all(allUserPasswordRequests)
				.then(function(){
					return accessToken;
				})
	}else {
		return Promise.resolve(accessToken);
	}
})
.then(function(accessToken){
	if(argv.adminrefresh){
		console.log(chalk.cyan("Refreshing password of OrgAdmin:"), chalk.bold(orgUsers.adminUser));
		return resetAdminAccountPassword(accessToken,orgUsers.orgId,orgUsers.adminPassword);
	} else {
		return ;
	}
})
.then(function(){
	orgUsers.lastUpdated= new Date();
	fs.writeFile(dstfile, JSON.stringify(orgUsers, null, 2));
	console.log(chalk.cyan("Operation Successful, updating file:"), chalk.bold(dstfile));
})
.catch(function(e){
	console.error("Error occured",e.message || e);
});
