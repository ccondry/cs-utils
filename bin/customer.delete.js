#!/usr/bin/env node
'use strict';
var sdk = require("../sdk/ContextService.js"),
	chalk = require("chalk"),
	argv = require('minimist')(process.argv.slice(2));
if(argv.help ){
	console.log(chalk.yellow("Usage: cs-customer-delete --token --id [--discovery] [--prod]  [--help]"));
	return;
}
if(!argv.token ){
	console.log(chalk.red("Please provide token"));
	console.log(chalk.yellow("Usage: cs-customer-delete --token --id [--discovery] [--prod]  [--help]"));
	return;
}
if(!argv.id ){
	console.log(chalk.red("Please provide customer id"));
	console.log(chalk.yellow("Usage: cs-customer-delete --token --id [--discovery] [--prod]  [--help]"));
	return;
}
var discovery = 'https://discovery.rciad.ciscoccservice.com/';
if(typeof argv.discovery === 'string'){
	discovery = argv.discovery;
}

sdk.init({token: argv.token, discovery:discovery},{ LAB_MODE: !argv.prod, DISABLE_CACHE: true  })
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
