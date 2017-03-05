#!/usr/bin/env node
var chalk = require("chalk"),
	fs = require('fs'),
	Promise = require('es6-promise').Promise,
	request = require('request-promise'),
	auth = require("../index.js").Auth,
	argv = require('minimist')(process.argv.slice(2));
if(argv.help ){
	console.log(chalk.yellow("Usage: cs-reset-refresh-accounts --file <json file>"));
	return;
}
if(!argv.file ){
	console.log(chalk.red("Please provide org details json file"));
	console.log(chalk.yellow("Usage: cs-reset-refresh-accounts --file <json file>"));
	return;
}
//read org users json
var orgUsers = JSON.parse(fs.readFileSync(argv.file, 'utf8'));

if(!orgUsers.adminUser || !orgUsers.adminPassword || !orgUsers.orgId){
	console.log(chalk.red("Invalid org details json file! Please provide admin user, admin password & org id."));
	return;
}
console.log(chalk.dim("Getting access token for Org Admin..."));
auth.getOrgAdminToken(orgUsers.adminUser,orgUsers.adminPassword,orgUsers.orgId,"Identity:Organization Identity:SCIM")
.then(function(token){
	if(Array.isArray(orgUsers.machineAccounts) && orgUsers.machineAccounts.length>0){
		// if machineAccounts are present as an array then reset all machine accounts
		var allPasswordRequests = [];
		console.log(chalk.dim("Setting new passwords for"), chalk.bold(orgUsers.machineAccounts.length),chalk.dim("machine accounts"));

		orgUsers.machineAccounts.forEach(function(machineAccount){
			console.log(chalk.green("Setting new password for Machine account:"), chalk.bold(machineAccount.name));
			machineAccount.password = generateNewPassword();
			allPasswordRequests.push(
				setMachineAccountPassword(token.access_token,orgUsers.orgId,machineAccount.id,machineAccount.password));
		});
		return Promise.all(allPasswordRequests)
				.then(function(){
					// All updates are done, so pass the org admin token
					return token.access_token;
				});
	}
	//Otherwise find inactive machine accounts, set new passwords & swap with active accounts
	else if(orgUsers.machineAccounts && orgUsers.machineAccounts.inactive && orgUsers.machineAccounts.inactive.length>0){

		var allPasswordRequests = [];
		console.log(chalk.dim("Setting new passwords for"), chalk.bold(orgUsers.machineAccounts.inactive.length),chalk.dim("inactive machine accounts"));
		orgUsers.machineAccounts.inactive.forEach(function(machineAccount){
			console.log(chalk.green("Setting new password for Machine account:"), chalk.bold(machineAccount.name));
			machineAccount.password = generateNewPassword();
			allPasswordRequests.push(
				setMachineAccountPassword(token.access_token,orgUsers.orgId,machineAccount.id,machineAccount.password));
		});
		return Promise.all(allPasswordRequests)
				.then(function(){
					//swap inactive & active.
					console.log(chalk.dim("Swapping active & inactive machine accounts"));
					var temp = orgUsers.machineAccounts.active;
					orgUsers.machineAccounts.active = orgUsers.machineAccounts.inactive;
					orgUsers.machineAccounts.inactive = temp;
					// All updates are done, so pass the org admin token
					return token.access_token;
				})
	}else {
		// just pass the org admin token
		return Promise.resolve(token.access_token)
	}
})
.then(function(accessToken){
	// Get all users and refresh their password
	if(orgUsers.users && orgUsers.users.length>0){
		var allUserPasswordRequests = [];
		orgUsers.users.forEach(function(user){
			console.log(chalk.green("Refreshing password of User:"), chalk.bold(user.userName));
			allUserPasswordRequests.push(
				setUserPassword(accessToken,orgUsers.orgId,user.id,user.password));
		});
		return Promise.all(allUserPasswordRequests)
				.then(function(){
					// All updates are done, so pass the org admin token
					return accessToken;
				})
	}else {
		// just pass the org admin token
		return Promise.resolve(accessToken);
	}
})
.then(function(accessToken){
	// Now refresh Org admin password
	console.log(chalk.green("Refreshing password of OrgAdmin:"), chalk.bold(orgUsers.adminUser));
	return resetAdminAccountPassword(accessToken,orgUsers.orgId,orgUsers.adminPassword);
})
.then(function(){
	// Update org json file
	orgUsers.lastUpdated= new Date(); // record timestamp when accounts were updated
	fs.writeFile(argv.file, JSON.stringify(orgUsers, null, "\t"));
	console.log(chalk.dim("Operation Successful, updating file:"), chalk.bold(argv.file));
})
.catch(function(e){
	console.error("Error occured", e.message || e.stack || e);
});

/*Private methods*/

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
	var promise;
	var CI_MAX_PASSWORD_HISTORY = process.env.CI_MAX_PASSWORD_HISTORY || 5;
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

var generateNewPassword = function(){
	return 'eeFF12$' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
};
