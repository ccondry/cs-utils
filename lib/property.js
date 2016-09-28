'use strict';

var Promise = require('es6-promise').Promise,
	axios = require('axios'),
	tokenAuthenticator = require('./TokenAuthenticator');

//harcoding here becuase this account should only be used for properties
var account = 'thunderhead_super_duper_user',
		password = 'ASDF.asdf.11.ASDF.asdf.11.ASDF.asdf.14',
		superDuperOrgId = 'a1a8c535-1c95-45de-98d0-745796816928';

var tokenCache;
var propertyPath;

function getApi(url, token ) {
	return new Promise((resolve, reject) =>
				 {
					 var headers = {
						 "Authorization": "Bearer " + token
					 };
					 axios({ url: url,
									 method: 'get',
									 headers: headers,
									 timeout: 10000
								})
								.then(function (response) {
										console.log(JSON.stringify(response.data));
										resolve(response.data);
								},function(err){
										console.log("## GET API Error ",err);
										reject(err);
								});
				 });
}

function putApi(url, data, token) {
    return new Promise((resolve, reject) =>
    {
				var headers = {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + token
				};
        console.log("About to PUT", url, headers);
        console.log("About to PUT this data:", data);
        axios ({
            url: url,
            method: 'put',
            headers: headers,
            data: data,
            timeout: 10000
        }).then (function (response) {
            console.log("PUT API response: ",{response}, JSON.stringify(response.data));
            resolve(response.data);
        },function (error) {
            console.log ("PUT API Error: ", error);
            reject (error);
        });
    });
}

module.exports = {

	updateProperty: function (discoveryUrl, orgId, propertyName, propertyValue, includeKmsScopes) {

			return  Promise.resolve().then(function (){
				if(!discoveryUrl || !propertyName || !propertyValue
						|| typeof discoveryUrl !== 'string' || typeof propertyName !== 'string'
						|| typeof propertyValue !== 'string'
					  || discoveryUrl.length === 0  || propertyName.length === 0
						|| propertyValue.length === 0) {
					throw new Error('Required parameters: discoveryUrl, propertyName, propertyValue');
				}
				discoveryUrl = discoveryUrl.trim();
				propertyName = propertyName.trim();

				orgId = orgId || superDuperOrgId;

				var values = propertyValue.split(',').map(function(elem){ return elem.trim(); });
				propertyValue = values.join(',');

				console.log('discoveryUrl:'+discoveryUrl+', orgId: '+orgId+' propertyName: '+propertyName+' propertyValue: '+propertyValue+' includeKmsScopes: '+includeKmsScopes);
			}).then(function () {
				var tokenPromise ;
				tokenPromise = tokenAuthenticator.getOrgAdminToken();
				return tokenPromise.then(function (token){
					 tokenCache = token.access_token;
					 return tokenCache;
				});
				// if(orgId !== superDuperOrgId){
				// 		console.log("Retriveing token for TestUsers");
				// 		tokenPromise = tokenAuthenticator.getOrgAdminToken(undefined,undefined,orgId,includeKmsScopes);
				// }else{
				// 	if (tokenCache) {
				// 		console.log("Using tokenCache ",tokenCache);
				// 	}else{
				// 		//console.log("Using available tokenCache ",tokenCache);
				// 		tokenPromise = tokenAuthenticator.getOrgAdminToken(account, password, orgId, includeKmsScopes);
				// 	}
				// }
				// if (tokenCache) {
				// 	console.log("Using tokenCache ",tokenCache);
				// }else{
				// 	tokenPromise = tokenAuthenticator.getOrgAdminToken(account, password, orgId, includeKmsScopes);
				// }
			}).then(function (token){
				 return getApi(discoveryUrl+'/discovery/apps/v1/', token).then(function (services){
						var management = services.find(function(elem){ return elem.service == 'management'; });
		 				return management.endpoints[0].location;
				 });
			}).then(function (managementServiceLoc) {

				console.log({managementServiceLoc});
				var getPath = managementServiceLoc+'/management/property/v1/propertyName/feature.org.'+orgId;
				return getApi(getPath, tokenCache, null).then(function (property) {
					var updatePath = managementServiceLoc+"/management/property/v1/propertyName/feature.org." +orgId;
					return putApi(updatePath, { name: 'feature.org.'+orgId , value: propertyValue, lastUpdated: property.lastUpdated }, tokenCache);
				});
			});
	}

	// var getHeaders = ()=>{
	//     var token = getToken()||{};
	//     return {
	//         "Content-Type": "application/json",
	//         "Authorization": "Bearer " + token.access_token
	//     }
	// };


	// getToken: function(account, password, orgId, includeKmsScopes){
	// 	if (tokenCache) {
	// 		return Promise.resolve(tokenCache);
	// 	}
	// 	var user  = users.getNextTestUser();
	// 	account = account || user.name;
	// 	password = password || user.password;
	// 	orgId = orgId || user.orgId;
	// 	var scopes = includeKmsScopes ? [SCOPE, KMS_SCOPES].join(" ") : SCOPE;
	//
	// 	return new Promise(function (resolve, reject) {
	//
	// 		var args = {
	// 			data: {
	// 				"name": account,
	// 				"password": password
	// 			},
	// 			headers: {"Content-Type": "application/json"}
	// 		};
	//
	// 		axios({
	// 			url: "https://" + IDENTITY_BROKER + "/idb/token/" + orgId + "/v2/actions/GetBearerToken/invoke",
	// 			method: "post",
	// 			data: JSON.stringify(args.data),
	// 			headers: args.headers
	// 		})
	// 		.then(function (response) {
	// 				// console.log(response);
	// 				var authHeader = new Buffer(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64");
	// 				var args = {
	// 					parameters: {
	// 						"grant_type": "urn:ietf:params:oauth:grant-type:saml2-bearer",
	// 						"assertion": response.data.BearerToken,
	// 						"scope": scopes
	// 					},
	// 					headers: {
	// 						"Content-Type": "application/x-www-form-urlencoded",
	// 						"Authorization": "Basic " + authHeader
	// 					}
	// 				};
	// 				return axios({
	// 					url: "https://" + IDENTITY_BROKER + "/idb/oauth2/v1/access_token",
	// 					method: "post",
	// 					params: args.parameters,
	// 					headers: args.headers
	// 				});
	// 			})
	// 			.then(function (response) {
	// 				// console.log('Got Token',response.data);
	// 				tokenCache = response.data;
	// 				resolve(response.data);
	// 			})
	// 			.catch(function (err) {
	// 				// console.log('Error',err);
	// 				reject(err);
	// 			});
	// 	});
	// }
};
