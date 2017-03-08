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

/**
 * Polls and waits for the featureManager cache of the context service component to expire
 * Since each webapp maintains its own feature cache AND we can't flush the feature cache without
 * ops credentials, we must poll for the feature property change to take effect on the management webapp.
 * We also must wait at least 5 seconds after the last read (a read we're forcing below) before the task feature
 * can be used.
 * @param propertyName
 * @param propertyValue
 * @param managementServiceLoc
 * @returns {*|Promise|axios.Promise|Promise.<TResult>|{catch}}
 */
function waitForFeatureChange (propertyName,propertyValue, managementServiceLoc){
	if(propertyName.startsWith('feature')){
		return poll(function(){
			var getPath = managementServiceLoc+'/management/property/v1/user/propertyName/feature';
			return rest.getApi(getPath, access_token)
				.then(function(response){
					console.log("The response", response);
					return areFeaturesPresent(propertyValue, response.value);
				})
		}).then(function () {
			return tokenAuthenticator.getToken(null, null, null,true)
				.then(function (token) {
					//This request forces the feature manager cache to load in context service
					var contextServiceBaseUrl = managementServiceLoc.replace("management", "context-service");
					var getPath = contextServiceBaseUrl + '/context/context/v1/search/?op=AND&type=pod&wg=lab&tags=stupiduselesstag';
					return rest.getApi(getPath, token.access_token)
				}).then(() => new Promise(resolve => setTimeout(resolve, 7000))); //waits for cache to expire from previous cache read
		});
	}
}

/**
 * Checks if a comma-separated list of features includes all of the expected features.
 */
function areFeaturesPresent (expectedFeatures, actualFeatures) {
	var expectedFeatureList = expectedFeatures.split(',');
	var actualFeatureList = actualFeatures.split(',');

	// Check if each feature in the expected list is in the actual list
	for (var index = 0; index < expectedFeatureList.length; index++) {
		if (actualFeatureList.indexOf(expectedFeatureList[index]) === -1) {
			return false;
		}
	}

	return true;
}

/**
 * Retries the passed in function until success or timeout
 * @param fn
 * @param timeout in milliseconds
 * @param interval milliseconds
 * @returns {*}
 */
function poll(fn, timeout, interval) {
	var endTime = Number(new Date()) + (timeout || 15000);
	interval = interval || 2000;

	var checkCondition = function(resolve, reject) {
		function reCheck() {
			fn()
				.catch(function(response){
					return false;
				}).then(function (result) {
				if(result){
					resolve();
				}
				// If the condition isn't met but the timeout hasn't elapsed, go again
				else if (Number(new Date()) < endTime) {
					setTimeout(reCheck, interval);
				}
				// Didn't match and too much time, reject!
				else {
					reject(new Error('timed out for ' + fn + ': ' + arguments));
				}
			});
		};
		reCheck();
	};

	return new Promise(checkCondition);
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
			}).then(function (){
				return waitForFeatureChange(propertyName, propertyValue, managementServiceLoc);
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
				var postPath = managementServiceLoc + '/management/property/v1/';
				return rest.postApi(postPath, {name: propertyName, value: propertyValue}, access_token)
					.then(function () {
						return waitForFeatureChange(propertyName, propertyValue, managementServiceLoc);
					});
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
			}).then(function (managementServiceLoc) {
				var deletePath = managementServiceLoc+'/management/property/v1/propertyName/'+propertyName;
				return rest.deleteApi(deletePath,access_token);
		}).then(() => new Promise(resolve => setTimeout(resolve, 7000)));
	}
};
