// Javascript test users
var users =require("./orgusers.json");
module.exports = {
	getNextTestUser : function(){
		var index = Math.floor(Math.random() * users.machineAccounts.length),
			account  = users.machineAccounts[index];
		return {
			id: account.id,
			name: account.name,
			orgId: users.orgId,
			password: users.machineAccountPassword
		};
	}
};
