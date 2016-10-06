#!/usr/bin/env node
'use strict';
var fs = require('fs'),
	xml2js = require('xml2js'),
	chalk = require("chalk");

/*
* Recursively add package name for all nested testsuites
*/
var processTestSuite = function (obj,name){
	if(!obj||!obj.testsuite)
		return undefined;
	var processedTestSuites = [];
	obj.testsuite.forEach(function(suite){
		var suiteName = suite['$'].name;
		var packageName = name? name +"."+suiteName : suiteName
		suite['$'].name = packageName;
		var childTestSuites = processTestSuite(suite,packageName);
		if(childTestSuites)
			suite.testsuite=childTestSuites
		processedTestSuites.push(suite);
	});
	return processedTestSuites;
}

if(process.argv.length<3 ){
	console.log(chalk.yellow("Usage: cs-jenkins-report <report.xml> [<output.xml>]"));
	return;
}
var sourceFile = process.argv[2],
	destFile = process.argv[3] ||sourceFile;

fs.readFile(sourceFile,'utf8', (err, xml) => {
	if (err) throw err;
	xml2js.parseString(xml, function (err, xml) {
		if (err) throw err;
		var result = {testsuites:{}};
		var testsuitesName = xml.testsuites["$"] ? xml.testsuites["$"].name : undefined;
		result.testsuites["testsuite"] = processTestSuite(xml.testsuites,testsuitesName);
		var builder = new xml2js.Builder();
		var processedXml = builder.buildObject(result);
		fs.writeFile(destFile, processedXml, function(err) {
			if (err) throw err;
			console.log("The file "+destFile+" was saved!");
		});
	});
});
