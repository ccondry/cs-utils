'use strict';

var Promise = require('es6-promise').Promise,
	request = require('request-promise'),
	users = require('./TestUsers0.js');

var IDENTITY_BROKER = "idbroker.webex.com",
	SCOPE = "contact-center-context:pod_write contact-center-context:pod_read",
	CLIENT_ID = "C4c54c84bbe59c297bb181eedd925f8f455384287855fc4ad6c1ab672e16a5f7f",
	CLIENT_SECRET = "77bc2f97d481dcec3bfa7f981f3eb1dc184abb0b1bf1ff0c46376deaddfd20d8",
	KMS_SCOPES = 'webex-squared:kms_read webex-squared:kms_bind webex-squared:kms_write spark:kms';

var DEFAULT_ADMIN_USER = "javascript@cstest.org",
	DEFAULT_ADMIN_PASSWORD = "C1sco123==",
	DEFAULT_ADMIN_ORGID = "4f9178e2-8b6f-4db3-a00f-a723c3b709e9",
	DEFAULT_ADMIN_SCOPE = "Identity:Organization webexsquare:admin squared-fusion-mgmt:management contact-center-context:pod_write contact-center-context:pod_read",
	OOB_CLIENT_ID = "C11d7d1e6aa4cf9b54871dddea9d99580c3a3e1204adc871fc90e8cb53f6d5403",
	OOB_CLIENT_SECRET = "857cb34de7f914c01b74cc442b103e086beb9a0505b926045e41c45c4babd4f7",
	CISCO_COOKIE_NAME = 'cisPRODiPlanetDirectoryPro',
	CISCO_COOKIE_DOMAIN = '.webex.com'
	;
// only fetch token once
var tokenCache;
var orgAdminTokenCache;

module.exports = {

	getToken: function(account, password, orgId, includeKmsScopes){
		if (tokenCache) {
			return Promise.resolve(tokenCache);
		}
		var user  = users.getNextTestUser();
		account = account || user.name;
		password = password || user.password;
		orgId = orgId || user.orgId;
		var scopes = includeKmsScopes ? [SCOPE, KMS_SCOPES].join(" ") : SCOPE;

		return new Promise(function (resolve, reject) {

			var args = {
				data: {
					"name": account,
					"password": password
				},
				headers: {"Content-Type": "application/json"}
			};
			request.post(
				"https://" + IDENTITY_BROKER + "/idb/token/" + orgId + "/v2/actions/GetBearerToken/invoke",
				{
				body: JSON.stringify(args.data),
				headers: args.headers
			})
			.then(function (response) {
					var authHeader = new Buffer(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64");
					var args = {
						parameters: {
							"grant_type": "urn:ietf:params:oauth:grant-type:saml2-bearer",
							"assertion": JSON.parse(response)["BearerToken"],
							"scope": scopes
						},
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
							"Authorization": "Basic " + authHeader
						}
					};
					return request.post(
 						"https://" + IDENTITY_BROKER + "/idb/oauth2/v1/access_token",
						{
						form: args.parameters,
						headers: args.headers
					});
				})
				.then(function (response) {
					//console.log('Got Token',response);
					tokenCache = JSON.parse(response);
					resolve(tokenCache);
				})
				.catch(function (err) {
					//console.log('Error',err);
					reject(err);
				});
		});
	},

	getOrgAdminToken :function(username, password, orgId,scopes){
		if (orgAdminTokenCache) {
			return Promise.resolve(orgAdminTokenCache);
		}
		username = username || DEFAULT_ADMIN_USER;
		password = password || DEFAULT_ADMIN_PASSWORD;
		orgId = orgId || DEFAULT_ADMIN_ORGID;
		var scopes = scopes || DEFAULT_ADMIN_SCOPE;
		return new Promise(function (resolve, reject) {
				var args = {
					parameters: {
						"IDToken1": username,
						"IDToken2": password
					},
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				};
				request.post("https://" + IDENTITY_BROKER + "/idb/UI/Login?org="+orgId,{
						form: args.parameters,
						headers: args.headers
				})
				.catch(function (error) {
					var ciscoCookie = error.response.headers['set-cookie'].find(function(cookie){
						return cookie.indexOf(CISCO_COOKIE_NAME) ==0 && cookie.indexOf(CISCO_COOKIE_DOMAIN) >0
					});

					var  cookieVal = ciscoCookie.split(CISCO_COOKIE_NAME + "=")[1].split(';')[0];
					var cookieJar = request.jar();
					cookieJar.setCookie('cisPRODiPlanetDirectoryPro=' + cookieVal + ' ; path=/; domain=.webex.com', 'https://idbroker.webex.com/');

					var args = {
						parameters: {
							"response_type": "code",
							"redirect_uri": "urn:ietf:wg:oauth:2.0:oob",
							"client_id":OOB_CLIENT_ID,
							"scope" : scopes,
							"realm" : "/"+orgId,
							"state" : new Date().getTime()
						}
					};
					return request.get("https://idbroker.webex.com/idb/oauth2/v1/authorize", {
						jar:cookieJar,
						qs: args.parameters
					});
				 })
				 .then(function(resp){
					var title = resp.match(/<title>(.*)</);
		 			if (!title) {
		 				reject( new Error('Failed to get auth code from response title.'));
		 			}
					var code= title[1],
						authHeader = new Buffer(OOB_CLIENT_ID + ":" + OOB_CLIENT_SECRET).toString("base64"),
						args = {
						parameters: {
							"grant_type": "authorization_code",
							"redirect_uri": "urn:ietf:wg:oauth:2.0:oob",
							"code":code
						},
						headers: {
							"Content-Type" : "application/x-www-form-urlencoded",
							"Authorization": "Basic "+authHeader,
						}
					};
					return request("https://idbroker.webex.com/idb/oauth2/v1/access_token", {
						method: 'post',
						form: args.parameters,
						headers: args.headers
					});
				})
				.then(function(response){
					orgAdminTokenCache = JSON.parse(response);
					resolve(orgAdminTokenCache);
				})
				.catch(function(err){
					reject(err);
				 });
		});
	}
};
