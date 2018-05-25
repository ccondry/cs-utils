#!/usr/bin/env node
'use strict';
var sdk = require("../sdk/ContextService.js"),
	help = require("./help.js"),
	chalk = require("chalk"),
	client = require('./client.js'),
	argv = require('minimist')(process.argv.slice(2));
if(argv.help ){
	help.showHelp('cs-pod-delete',{id:true});
	return;
}
if(!argv.token ){
	console.log(chalk.red("Please provide token"));
	help.showHelp('cs-pod-delete',{id:true});
	return;
}
if(!argv.id ){
	console.log(chalk.red("Please provide pod id"));
	help.showHelp('cs-pod-delete',{id:true});
	return;
}
var discovery = 'https://discovery.produs1.ciscoccservice.com/';
if(typeof argv.discovery === 'string'){
	discovery = argv.discovery;
}

sdk.init({token: argv.token, discovery:discovery, clientId: client.id, clientSecret: client.secret},{ LAB_MODE: !argv.prod, DISABLE_TIMERS: true, SERVICE_NAME:"jstestutils"  })
.then(function(){
	var pod = sdk.constructPod();
	pod.id= argv.id;
	return sdk.delete(pod);
})
.then(function(){
	console.log(chalk.green("Successfully deleted POD with ID :" + argv.id));
})
.catch(function(e){
	console.error(chalk.red("Cannot delete pod with id "),  chalk.bold(argv.id), (e.data? e.data.error: e)||'');
});
