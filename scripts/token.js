(function(){
	var auth = require("../index.js").Auth,
		chalk = require("chalk");

	auth.getToken()
	.then(function(token){
		console.log(chalk.gray("************************ ACCESS TOKEN ************************"));
		console.log(chalk.green(token.access_token))
		console.log(chalk.gray("**************************************************************"));
	})
	.catch(function(e){
		console.error("Error getting token",e);
	});
})();
