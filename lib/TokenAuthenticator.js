'use strict';

var Promise = require('es6-promise').Promise,
	axios = require('axios');

var IDENTITY_BROKER = 'idbroker.webex.com',
	SCOPE = 'contact-center-context:pod_write contact-center-context:pod_read',
	CLIENT_ID = 'C11d7d1e6aa4cf9b54871dddea9d99580c3a3e1204adc871fc90e8cb53f6d5403',
	CLIENT_SECRET = '857cb34de7f914c01b74cc442b103e086beb9a0505b926045e41c45c4babd4f7',
	ORGID = 'a1a8c535-1c95-45de-98d0-745796816928',
	TEST_MACHINE_ACCOUNT = 'thunderhead-dev2',
	TEST_MACHINE_ACCOUNT_PASSWORD = 'ASDF.asdf.22.ASDF.asdf.22.ASDF.asdf.22';

// only fetch token once
let tokenCache;

module.exports = {

	getToken : function(){
		if (tokenCache) {
			return  Promise.resolve(tokenCache) ;
		}

		return new Promise(function (resolve, reject) {

			var args = {
				data: {
					'name': TEST_MACHINE_ACCOUNT,
					'password': TEST_MACHINE_ACCOUNT_PASSWORD
				},
				headers: {'Content-Type': 'application/json'}
			};

			axios({
				url: 'https://' + IDENTITY_BROKER + '/idb/token/' + ORGID + '/v2/actions/GetBearerToken/invoke',
				method: 'post',
				data: JSON.stringify(args.data),
				headers: args.headers
			})
			.then(function (response) {
					// console.log(response);
					const authHeader = new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64');
					const args = {
						parameters: {
							'grant_type': 'urn:ietf:params:oauth:grant-type:saml2-bearer',
							'assertion': response.data.BearerToken,
							'scope': SCOPE
						},
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Authorization': 'Basic ' + authHeader
						}
					};
					return axios({
						url: 'https://' + IDENTITY_BROKER + '/idb/oauth2/v1/access_token',
						method: 'post',
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
}
