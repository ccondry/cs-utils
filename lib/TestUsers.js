// Javascript test users
var orgData =require("../config/jstestorg.json");
module.exports = {
	getNextTestUser : function(){
		var index = Math.floor(Math.random() * orgData.machineAccounts.active.length),
			machineAccount  = orgData.machineAccounts.active[index];
		return {
			id: machineAccount.id,
			name: machineAccount.name,
			password: machineAccount.password
		};
	},
	orgId:orgData.orgId,
	adminUser:orgData.adminUser,
	adminPassword:orgData.adminPassword
};
