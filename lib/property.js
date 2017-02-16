'use strict';

var Promise = require('es6-promise').Promise,
	tokenAuthenticator = require('./TokenAuthenticator'),
	rest = require('./rest');

var DEFAULT_JS_TEST_ORG = tokenAuthenticator.DEFAULT_JS_TEST_ORG;

var access_token;

function getManagementEndpoint (discoveryURL, token){
	discoveryURL = discoveryURL.replace(/\/+$/, '');//remove trailing slash
	return rest.getApi(discoveryURL+'/discovery/apps/v1/', token).then(function (services){
		 var management = services.find(function(elem){ return elem.service == 'management'; });
		 return management.endpoints[0].location;
	});
}

function getAccessToken (orgId, includeKmsScopes){
	var tokenPromise = tokenAuthenticator.getOrgAdminToken(null, null, DEFAULT_JS_TEST_ORG, includeKmsScopes);

	return tokenPromise.then(function (token){
		 access_token = token.access_token;
		 return access_token;
	});
}

module.exports = {

	/*
		Updates the property using the property API which uses full admin access_token
		Required params -
		discoveryURL: a string value. https://ankmuley-discovery.dev.ciscoccservice.com
		propertyValue: a string value. value must be string and not be empty
		orgId: a string value.
		Optional params -
		propertyName: a string value. If propertyName is not provided,it is contructed using the orgId. ex, feature.orgId.12345
		includeKmsScopes: a boolean indicating whether to include kms scope in access_token
	*/
	updateProperty: function (discoveryUrl, propertyValue, orgId, propertyName, includeKmsScopes) {
		if(!discoveryUrl || typeof discoveryUrl !== 'string'|| discoveryUrl.length === 0) {
			throw new Error('Required parameters: discoveryUrl');
		}else if(!orgId || typeof orgId !== 'string'|| orgId.length === 0) {
			throw new Error('Required parameters: orgId');
		}else if(!propertyValue || typeof propertyValue !== 'string'|| propertyValue.length === 0){
			throw new Error('Required parameters: propertyValue');
		}

		discoveryUrl = discoveryUrl.trim();
		propertyName =  propertyName || ((orgId !== null || orgId !== undefined) ? 'feature.org.'+orgId : undefined);

		propertyValue = propertyValue.split(',').map(function(elem){ return elem.trim(); }).join(',');
		includeKmsScopes = includeKmsScopes || false;

		var managementServiceLoc = undefined;

		return getAccessToken(orgId, includeKmsScopes)
			.then(function () {
				return getManagementEndpoint(discoveryUrl, access_token);
			})
			.then(function (managementServiceLocation) {
				managementServiceLoc = managementServiceLocation;
				var getPath = managementServiceLoc+'/management/property/v1/propertyName/'+propertyName;
				return rest.getApi(getPath, access_token);
			})
			.then(function (property) {
				var updatePath = managementServiceLoc+'/management/property/v1/propertyName/' + propertyName;
				return rest.putApi(updatePath, { name: propertyName , value: propertyValue,
					lastUpdated: property.lastUpdated }, access_token);
			});
	},

	/*
		Retrieves the property using the property API which uses full admin access_token
		Required params -
		discoveryURL: a string value. https://ankmuley-discovery.dev.ciscoccservice.com
		orgId: a string value.
		Optional params -
		propertyName: a string value. If propertyName is not provided,it is contructed using the orgId. ex, feature.orgId.12345
		includeKmsScopes: a boolean indicating whether to include kms scope in access_token
	*/
	getProperty: function (discoveryUrl, orgId, propertyName, includeKmsScopes) {
			if(!discoveryUrl || typeof discoveryUrl !== 'string' || discoveryUrl.length === 0 ) {
				throw new Error('Required parameter: discovery URL');
			}else if(!orgId || typeof orgId !== 'string'|| orgId.length === 0) {
				throw new Error('Required parameters: orgId');
			}

			discoveryUrl = discoveryUrl.trim();
			propertyName =  propertyName || (orgId !== null || orgId !== undefined) ? 'feature.org.'+orgId : 'feature';
			includeKmsScopes = includeKmsScopes || false;

			return getAccessToken(orgId, includeKmsScopes)
				.then(function () {
					return getManagementEndpoint(discoveryUrl, access_token);
				})
				.then(function (managementServiceLoc) {
					var getPath = managementServiceLoc+'/management/property/v1/propertyName/'+propertyName;
					return rest.getApi(getPath, access_token);
			});
	},

	/*
		Create a property using the property API which uses full admin access_token
		Required params -
		discoveryURL: a string value. https://ankmuley-discovery.dev.ciscoccservice.com
		propertyValue: a string value. value must be string and not be empty
		orgId: a string value.
		Optional params -
		propertyName: a string value. If propertyName is not provided,it is contructed using the orgId. ex, feature.orgId.12345
		includeKmsScopes: a boolean indicating whether to include kms scope in access_token. Default - false
	*/
	createProperty : function(discoveryUrl, propertyValue, propertyName, orgId, includeKmsScopes){
		if(!discoveryUrl || typeof discoveryUrl !== 'string' || discoveryUrl.length === 0 ) {
			throw new Error('Required parameter: discovery URL');
		}else if(!propertyValue || typeof propertyValue !== 'string' || propertyValue.length === 0){
			throw new Error('Required parameter: propertyValue');
		}else if(!orgId || typeof orgId !== 'string'|| orgId.length === 0) {
			throw new Error('Required parameter: orgId');
		}

		discoveryUrl = discoveryUrl.trim();
		propertyName =  propertyName || ((orgId !== null || orgId !== undefined) ? 'feature.org.'+orgId : undefined);
		propertyValue = propertyValue.split(',').map(function(elem){ return elem.trim(); }).join(',');
		includeKmsScopes = includeKmsScopes || false;

		return getAccessToken(orgId, includeKmsScopes)
			.then(function () {
				return getManagementEndpoint(discoveryUrl, access_token);
			})
			.then(function (managementServiceLoc) {
				var postPath = managementServiceLoc+'/management/property/v1/';
				return rest.postApi(postPath,{ name:propertyName, value: propertyValue } ,access_token);
		  });
	},

	/*
		Deletes a property using the property API which uses full admin access_token
		Required params -
		discoveryURL: a string value. https://ankmuley-discovery.dev.ciscoccservice.com
		orgId: a string value.
		Optional params -
		propertyName: a string value. If propertyName is not provided,it is contructed using the orgId. ex, feature.orgId.12345
		includeKmsScopes: a boolean indicating whether to include kms scope in access_token. Default - false
	*/
	deleteProperty : function (discoveryUrl, orgId ,propertyName, includeKmsScopes){
		if(!discoveryUrl || typeof discoveryUrl !== 'string' || discoveryUrl.length === 0) {
			throw new Error('Required parameter: discovery URL');
		}else if(!orgId || typeof orgId !== 'string'|| orgId.length === 0) {
			throw new Error('Required parameter: orgId');
		}

		discoveryUrl = discoveryUrl.trim();
		propertyName =  propertyName || ((orgId !== null || orgId !== undefined) ? 'feature.org.'+orgId : undefined);
		includeKmsScopes = includeKmsScopes || false;

		return getAccessToken(orgId, includeKmsScopes)
			.then(function () {
				return getManagementEndpoint(discoveryUrl, access_token);
			})
			.then(function (managementServiceLoc) {
				var deletePath = managementServiceLoc+'/management/property/v1/propertyName/'+propertyName;
				return rest.deleteApi(deletePath,access_token);
	  	});
	}
};
