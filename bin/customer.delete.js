#!/usr/bin/env node
'use strict';
var sdk = require("../sdk/ContextService.js"),
	help = require("./help.js"),
	chalk = require("chalk"),
	client = require('./client.js'),
	argv = require('minimist')(process.argv.slice(2));
if(argv.help ){
	help.showHelp('cs-customer-delete',{id:true});
	return;
}
if(!argv.token ){
	console.log(chalk.red("Please provide token"));
	help.showHelp('cs-customer-delete',{id:true});
	return;
}
if(!argv.id ){
	console.log(chalk.red("Please provide customer id"));
	help.showHelp('cs-customer-delete',{id:true});
	return;
}
var discovery = 'https://discovery.rciad.ciscoccservice.com/';
if(typeof argv.discovery === 'string'){
	discovery = argv.discovery;
}

sdk.init({token: argv.token, discovery:discovery, clientId: client.id, clientSecret: client.secret},{ LAB_MODE: !argv.prod, DISABLE_CACHE: true  })
.then(function(){
	var customer = sdk.constructCustomer();
	customer.id= argv.id;
	return sdk.delete(customer);
})
.then(function(){
	console.log(chalk.green("Successfully deleted Customer with ID :" + argv.id));
})
.catch(function(e){
	console.error(chalk.red("Cannot delete customer with id "),  chalk.bold(argv.id), (e.data? e.data.error: e)||'');
});
