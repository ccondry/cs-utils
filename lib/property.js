'use strict';

var Promise = require('es6-promise').Promise,
	axios = require('axios'),
	tokenAuthenticator = require('./TokenAuthenticator');

//SUPER DUPER ACCOUNT which have full-admin role
var SUPER_ACCOUNT_USERNAME = 'thunderhead_super_duper_user',
		SUPER_ACCOUNT_PASSWORD = 'ASDF.asdf.11.ASDF.asdf.11.ASDF.asdf.14',
		SUPER_ACCOUNT_ORGID = 'a1a8c535-1c95-45de-98d0-745796816928',
		DEFAULT_JS_TEST_ORG = '4f9178e2-8b6f-4db3-a00f-a723c3b709e9';

var access_token;
var TIMEOUT =10000; //10 secs


function getApi(url, token) {
	var headers = {
		'Authorization': 'Bearer ' + token
	};
	return Promise.resolve().then(function(){
		return axios({ url: url, method: 'get', headers: headers, timeout: TIMEOUT });
	}).then(function (response) {
			 return response.data;
	}).catch(function (err) {
		console.log('### GET API Error ### ',err);
		throw err;
	});
}

function putApi(url, data, token) {
	var headers = {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + token
	};
	return Promise.resolve().then(function(){
		return axios ({ url: url, method: 'put', headers: headers, data: data, timeout: TIMEOUT });
	}).then (function (response) {
			return response;
	}).catch(function (err) {
		console.log ('PUT API Error: ', err);
		throw err;
	});
}

function postApi(url, data, token) {
	var headers = {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + token
	};
  return  Promise.resolve().then(function(){
		return axios ({
				url: url,
				method: 'post',
				headers: headers,
				data: data,
				timeout: TIMEOUT
		});
	}).then (function (response) {
		console.log("Post API response: ", JSON.stringify(response.data));
		return response.data;
	}).catch (function (error) {
		console.log ("Post API Error: ", error);
		throw err;
	});

}

function deleteApi(url, token) {
	var headers = {
		"Authorization": "Bearer " + token
	};
	return Promise.resolve().then(function(){
		return axios({ url:url,
			method:'delete',
			headers: headers,
			timeout: TIMEOUT
		});
	})
	.then(function (response) {
		console.log("## DELETE API response ",JSON.stringify(response.data));
		return response.data;
	}).catch(function(err){
		console.log("## DELETE API Error ",err);
		throw err;
	});

}

function getManagementEndpoint (discoveryURL, token){
	return getApi(discoveryURL+'/discovery/apps/v1/', token).then(function (services){
		 var management = services.find(function(elem){ return elem.service == 'management'; });
		 return management.endpoints[0].location;
	});
}

function getAccessToken (orgId, includeKmsScopes){
	var tokenPromise = (orgId === SUPER_ACCOUNT_ORGID)
		? tokenAuthenticator.getOrgAdminToken(SUPER_ACCOUNT_USERNAME, SUPER_ACCOUNT_PASSWORD, SUPER_ACCOUNT_ORGID, includeKmsScopes)
		: tokenAuthenticator.getOrgAdminToken(null, null, null, includeKmsScopes);

	return tokenPromise.then(function (token){
		 access_token = token.access_token;
		 return access_token;
	});
}

module.exports = {

	updateProperty: function (discoveryUrl, orgId, propertyName, propertyValue, includeKmsScopes) {
		if(!discoveryUrl || typeof discoveryUrl !== 'string'|| discoveryUrl.length === 0) {
			throw new Error('Required parameters: discoveryUrl');
		}

		discoveryUrl = discoveryUrl.trim();
		orgId = orgId || SUPER_ACCOUNT_ORGID;
		propertyName =  propertyName || (orgId !== null || orgId !== undefined) ? 'feature.org.'+orgId : 'feature';
		propertyValue = propertyValue.split(',').map(function(elem){ return elem.trim(); }).join(',');
		includeKmsScopes = includeKmsScopes || false;

		return getAccessToken(orgId, includeKmsScopes)
			.then(function () {
				return getManagementEndpoint(discoveryUrl, access_token);
			})
			.then(function (managementServiceLoc) {
				var getPath = managementServiceLoc+'/management/property/v1/propertyName/'+propertyName;
				return getApi(getPath, access_token).then(function (property) {
					console.log('property:'+JSON.stringify(property));
					var updatePath = managementServiceLoc+'/management/property/v1/propertyName/' + propertyName;
					return putApi(updatePath, { name: propertyName , value: propertyValue,
						lastUpdated: property.lastUpdated }, access_token);
			});
		});
	},

	getProperty: function (discoveryUrl, orgId, propertyName, includeKmsScopes) {
			if(!discoveryUrl || typeof discoveryUrl !== 'string' || discoveryUrl.length === 0 ) {
				throw new Error('Required parameters: discovery URL');
			}
			discoveryUrl = discoveryUrl.trim();
			orgId = orgId || SUPER_ACCOUNT_ORGID;
			propertyName =  propertyName || (orgId !== null || orgId !== undefined) ? 'feature.org.'+orgId : 'feature';
			includeKmsScopes = includeKmsScopes || false;

			return getAccessToken(orgId, includeKmsScopes)
				.then(function () {
					return getManagementEndpoint(discoveryUrl, access_token);
				})
				.then(function (managementServiceLoc) {
					var getPath = managementServiceLoc+'/management/property/v1/propertyName/'+propertyName;
					return getApi(getPath, access_token).then(function (property) {
						return property;
					});
			});
	},

	createProperty : function(discoveryUrl, orgId, propertyName, propertyValue, includeKmsScopes){
		if(!discoveryUrl || typeof discoveryUrl !== 'string' || discoveryUrl.length === 0 ||
			!orgId || typeof orgId !== 'string' || orgId.length === 0 ) {
			throw new Error('Required parameters: discovery URL, orgId');
		}
		discoveryUrl = discoveryUrl.trim();
		orgId = orgId || SUPER_ACCOUNT_ORGID;
		propertyName =  propertyName || (orgId !== null || orgId !== undefined) ? 'feature.org.'+orgId : 'feature';
		propertyValue = propertyValue.split(',').map(function(elem){ return elem.trim(); }).join(',');
		includeKmsScopes = includeKmsScopes || false;

		return getAccessToken(orgId, includeKmsScopes)
			.then(function () {
				return getManagementEndpoint(discoveryUrl, access_token);
			})
			.then(function (managementServiceLoc) {
				var postPath = managementServiceLoc+'/management/property/v1/';
				return postApi(postPath,{ name:propertyName, value: propertyValue } ,access_token)
				.then(function (property) { return property; });
		  });
	},

	deleteProperty : function (discoveryUrl, orgId ,propertyName, includeKmsScopes){
		if(!discoveryUrl || typeof discoveryUrl !== 'string' || discoveryUrl.length === 0 ||
			!orgId || typeof orgId !== 'string' || orgId.length === 0 ) {
			throw new Error('Required parameters: discovery URL, orgId');
		}
		discoveryUrl = discoveryUrl.trim();
		orgId = orgId || SUPER_ACCOUNT_ORGID;
		propertyName =  propertyName || (orgId !== null || orgId !== undefined) ? 'feature.org.'+orgId : 'feature';
		includeKmsScopes = includeKmsScopes || false;

		return getAccessToken(orgId, includeKmsScopes)
			.then(function () {
				return getManagementEndpoint(discoveryUrl, access_token);
			})
			.then(function (managementServiceLoc) {
				var deletePath = managementServiceLoc+'/management/property/v1/propertyName/'+propertyName;
				return deleteApi(deletePath,access_token);
	  	});
	}
};
