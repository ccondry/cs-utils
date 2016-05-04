#!/usr/bin/env node
'use strict';
var sdk = require("../sdk/ContextService.js"),
	help = require("./help.js"),
	chalk = require("chalk"),
	client = require('./client.js'),
	argv = require('minimist')(process.argv.slice(2));
if(argv.help ){
	help.showHelp('cs-pod-create',{fieldset:true,field:true});
	return;
}
if(!argv.token ){
	console.log(chalk.red("Please provide token"));
	help.showHelp('cs-pod-create',{fieldset:true,field:true});
	return;
}
var discovery = 'https://discovery.rciad.ciscoccservice.com/';
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

var pod = sdk.constructPod();
pod.fieldsets = fieldsets;
pod.customerId = customerId;
pod.dataElements = dataElements;
sdk.init({token: argv.token, discovery:discovery, clientId: client.id, clientSecret: client.secret},{ LAB_MODE: !argv.prod, DISABLE_CACHE: true  })
.then(function(){
	return sdk.create(pod);
})
.then(function(podData){
	console.log(chalk.green("Successfully created POD with ID :" + podData.id));
})
.catch(function(e){
	console.error(chalk.red("Cannot create pod"),(e.data? e.data.error: e)||'');
});
