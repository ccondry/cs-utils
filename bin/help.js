var chalk = require("chalk");

module.exports = {
	showHelp : function(cmdName,options){
		console.log(chalk.yellow("Usage: "+cmdName+" --token ", ( options.id ?"--id ":""),
		"[--discovery] [--prod] ", ( options.customerId?"[--customerId] ":""), ( options.fieldset?"[--fieldset] ":""),( options.field?"[--field] ":""), "[--help]"));

		console.log(chalk.bold("--token <auth token>")," : specify access token");

		if(options.id)
			console.log(chalk.bold("--id <id>"), ": specify id to get/update/delete");

		console.log(chalk.bold("--discovery <discovery url>")," : discovery url for apis");
		console.log(chalk.bold("--prod")," : use production workspace. by default points to lab");

		if(options.customerId)
			console.log(chalk.bold("--customerId <customerId>")," : customerId id fpr pod");

		if(options.fieldset)
			console.log(chalk.bold("--fieldset <name>")," : fieldsets to use. Specify multiple fieldsets like --fieldset cisco.base.pod --fieldset custom.fieldset ");

		if(options.field)
			console.log(chalk.bold("--field <fieldname=fieldvalue>"),"  : dataElement field name and value.  Specify multiple fields as --field Context_Notes=abcdef Context_POD_Activity_Link=https://gmail.com ");

		console.log(chalk.bold("--help"),": for this help message");
	}
}
