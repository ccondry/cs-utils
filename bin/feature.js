#!/usr/bin/env node
'use strict';
var property = require("../index.js").Property,
	DEFAULT_JS_TEST_ORG = require("../index.js").Auth.DEFAULT_JS_TEST_ORG,
	chalk = require("chalk"),
	argv = require('minimist')(process.argv.slice(2));

if(argv.help ){
	console.log(chalk.yellow("Usage: cs-jsorg-feature --discovery <discovery url>  [--clear ]  <feature 1> <feature 2>"));
	return;
}
var discovery = 'https://discovery.produs1.ciscoccservice.com/';
if(typeof argv.discovery === 'string'){
	discovery = argv.discovery;
}
if(argv.clear){
	property.deleteProperty(discovery,DEFAULT_JS_TEST_ORG, 'feature.org.'+DEFAULT_JS_TEST_ORG)
	.then(function(){
		console.log(chalk.green("Successfully removed features for JS Test Org on " + discovery) );
	})
	.catch(function(e){
		console.error(chalk.red("Error clearing features "),  chalk.bold(argv.id),(e.data? e.data.error: e)||'');
	});
}else if( argv._ &&  argv._.length>0) {

	property.createProperty(discovery,argv._.join(),null,DEFAULT_JS_TEST_ORG)
	.then(function(){
		console.log(chalk.green("Successfully set features for JS Test Org on " + discovery) );
	})
	.catch(function(e){
		console.error(chalk.red("Error setting features "),  chalk.bold(argv.id),(e.data? e.data.error: e)||'');
	});
} else {
	console.log(chalk.bold("Either provide features to enable or --clear to reset feature flags "));
}
