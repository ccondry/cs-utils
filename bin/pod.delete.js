#!/usr/bin/env node
'use strict';
var sdk = require("../sdk/ContextService.js"),
	chalk = require("chalk"),
	argv = require('minimist')(process.argv.slice(2));
if(argv.help ){
	console.log(chalk.yellow("Usage: cs-pod-delete --token --id [--discovery] [--prod]  [--help]"));
	return;
}
if(!argv.token ){
	console.log(chalk.red("Please provide token"));
	console.log(chalk.yellow("Usage: cs-pod-delete --token --id [--discovery] [--prod]  [--help]"));
	return;
}
if(!argv.id ){
	console.log(chalk.red("Please provide pod id"));
	console.log(chalk.yellow("Usage: cs-pod-delete --token --id [--discovery] [--prod]  [--help]"));
	return;
}
var discovery = 'https://discovery.rciad.ciscoccservice.com/';
if(typeof argv.discovery === 'string'){
	discovery = argv.discovery;
}

sdk.init({token: argv.token, discovery:discovery},{ LAB_MODE: !argv.prod, DISABLE_CACHE: true  })
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
