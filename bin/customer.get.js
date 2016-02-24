#!/usr/bin/env node
'use strict';
var sdk = require("../sdk/ContextService.js"),
	help = require("./help.js"),
	chalk = require("chalk"),
	argv = require('minimist')(process.argv.slice(2));
if(argv.help ){
	help.showHelp('cs-customer-get',{id:true});
	return;
}
if(!argv.token ){
	console.log(chalk.red("Please provide token"));
	help.showHelp('cs-customer-get',{id:true});
	return;
}
if(!argv.id ){
	console.log(chalk.red("Please provide customer id"));
	help.showHelp('cs-customer-get',{id:true});
	return;
}
var discovery = 'https://discovery.rciad.ciscoccservice.com/';
if(typeof argv.discovery === 'string'){
	discovery = argv.discovery;
}

sdk.init({token: argv.token, discovery:discovery},{ LAB_MODE: !argv.prod, DISABLE_CACHE: true  })
.then(function(){
	return sdk.get(sdk.ENTITY_TYPES.CUSTOMER, argv.id);
})
.then(function(custData){
	console.log(chalk.gray("************************* CUSTOMER DATA *************************"));
	console.log(chalk.white("Field Sets:"),chalk.cyan(JSON.stringify(custData.fieldsets)))
	console.log(chalk.white("Data Elements:"),chalk.cyan(custData.dataElements ? JSON.stringify(custData.dataElements):{}));
	console.log(chalk.gray("************************************************************"));
})
.catch(function(e){
	console.error(chalk.red("Cannot get customer with id "),  chalk.bold(argv.id),(e.data? e.data.error: e)||'');
});
