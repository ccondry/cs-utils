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

var orgUsers = JSON.parse(fs.readFileSync(argv.srcfile, 'utf8'));
var dstfile = argv.dstfile || argv.srcfile;
orgUsers.machineAccountPassword = generateNewPassword();
auth.getOrgAdminToken(orgUsers.adminUser,orgUsers.adminPassword,orgUsers.orgId)
.then(function(token){
	var allPasswordRequests = [];
	orgUsers.machineAccounts.forEach(function(machineAccount){
		allPasswordRequests.push(setMachineAccountPassword(token.access_token,orgUsers.orgId,machineAccount.id,orgUsers.machineAccountPassword));
	});
	return Promise.all(allPasswordRequests);
})
.then(function(){
	orgUsers.lastUpdated= new Date();
	fs.writeFile(dstfile, JSON.stringify(orgUsers, null, 2));
	console.log(chalk.green("file updated : " +dstfile));
})
.catch(function(e){
	console.error("Error occured",e.data? e.data.error: e);
});
