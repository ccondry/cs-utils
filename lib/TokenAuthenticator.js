'use strict';

var Promise = require('es6-promise').Promise,
	axios = require('axios');

var IDENTITY_BROKER = "idbroker.webex.com",
	SCOPE = "contact-center-context:pod_write contact-center-context:pod_read",
	CLIENT_ID = "C4c54c84bbe59c297bb181eedd925f8f455384287855fc4ad6c1ab672e16a5f7f",
	CLIENT_SECRET = "77bc2f97d481dcec3bfa7f981f3eb1dc184abb0b1bf1ff0c46376deaddfd20d8",

	TEST_ORGID = "4eae6310-e122-4c04-a206-93ca5808c98c",
	TEST_MACHINE_ACCOUNT = "CS-Test-MA-Admin-Einstein",
	TEST_MACHINE_ACCOUNT_PASSWORD = "TVFN.tswn.67.VZJP.twjp.08.DXIJ.tilp.0358";

// only fetch token once
var tokenCache;

module.exports = {

	getToken: function(account, password, orgId, scope){
		if (tokenCache) {
			return Promise.resolve(tokenCache);
		}

		account = account || TEST_MACHINE_ACCOUNT;
		password = password || TEST_MACHINE_ACCOUNT_PASSWORD;
		orgId = orgId || TEST_ORGID;
		scope = [SCOPE, scope].join(" ").trim() || SCOPE;

		return new Promise(function (resolve, reject) {

			var args = {
				data: {
					"name": account,
					"password": password
				},
				headers: {"Content-Type": "application/json"}
			};

			axios({
				url: "https://" + IDENTITY_BROKER + "/idb/token/" + orgId + "/v2/actions/GetBearerToken/invoke",
				method: "post",
				data: JSON.stringify(args.data),
				headers: args.headers
			})
			.then(function (response) {
					// console.log(response);
					var authHeader = new Buffer(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64");
					var args = {
						parameters: {
							"grant_type": "urn:ietf:params:oauth:grant-type:saml2-bearer",
							"assertion": response.data.BearerToken,
							"scope": scope
						},
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
							"Authorization": "Basic " + authHeader
						}
					};
					return axios({
						url: "https://" + IDENTITY_BROKER + "/idb/oauth2/v1/access_token",
						method: "post",
						params: args.parameters,
						headers: args.headers
					});
				})
				.then(function (response) {
					// console.log('Got Token',response.data);
					tokenCache = response.data;
					resolve(response.data);
				})
				.catch(function (err) {
					// console.log('Error',err);
					reject(err);
				});
		});
	}
};
