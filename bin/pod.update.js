#!/usr/bin/env node
'use strict';
var sdk = require("../sdk/ContextService.js"),
	help = require("./help.js"),
	chalk = require("chalk"),
	client = require('./client.js'),
	argv = require('minimist')(process.argv.slice(2));
if(argv.help ){
	help.showHelp('cs-pod-update',{id:true,customerId:true,fieldset:true,field:true});
	return;
}
if(!argv.token ){
	console.log(chalk.red("Please provide token"));
	help.showHelp('cs-pod-update',{id:true,customerId:true,fieldset:true,field:true});
	return;
}
if(!argv.id ){
	console.log(chalk.red("Please provide pod id"));
	help.showHelp('cs-pod-update',{id:true,customerId:true,fieldset:true,field:true});
	return;
}

var discovery = 'https://discovery.produs1.ciscoccservice.com/';
if(typeof argv.discovery === 'string'){
	discovery = argv.discovery;
}

var fieldsets = ['cisco.base.pod'];
if(typeof argv.fieldset === 'string'){
	fieldsets = [];
	fieldsets.push(argv.fieldset)
} else if (argv.fieldset && Array.isArray(argv.fieldset)){
	fieldsets=argv.fieldset;
}

var customerId = '';
if(argv.customerId){
	customerId = argv.customerId + '';
}

var allFields = [],dataElements ={};
if(typeof argv.field === 'string'){
	allFields = [];
	allFields.push(argv.field)
} else if (argv.field && Array.isArray(argv.field)){
	allFields=argv.field;
}
allFields.forEach(function(value){
	if(typeof value === 'string') {
		var namevalue = value.split('=');
		if(namevalue.length==2){
			dataElements[namevalue[0]]=namevalue[1];
		}
	}
});

sdk.init({token: argv.token, discovery:discovery, clientId: client.id, clientSecret: client.secret},{ LAB_MODE: !argv.prod, DISABLE_TIMERS: true, SERVICE_NAME:"jstestutils"  })
.then(function(){
	return sdk.get(sdk.ENTITY_TYPES.POD, argv.id);
})
.then(function(pod){
	pod.fieldsets = fieldsets;
	pod.customerId = customerId;
	pod.dataElements = dataElements;
	return sdk.update(pod);
})
.then(function(podData){
	console.log(chalk.gray("********************** UPDATED POD DATA **********************"));
	console.log(chalk.white("Customer Id:"),chalk.cyan(podData.customerId ?JSON.stringify(podData.customerId):''))
	console.log(chalk.white("Field Sets:"),chalk.cyan(JSON.stringify(podData.fieldsets)))
	console.log(chalk.white("Data Elements:"),chalk.cyan(podData.dataElements ? JSON.stringify(podData.dataElements):{}));
	console.log(chalk.white("Tags:"),chalk.cyan(podData.tags?JSON.stringify(podData.tags):''));
	console.log(chalk.gray("**************************************************************"));
})
.catch(function(e){
	console.error(chalk.red("Cannot update pod with id "),  chalk.bold(argv.id),(e.data? e.data.error: e)||'');
});
