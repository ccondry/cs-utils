const request = require('request-promise')
const querystring = require('querystring')
const utils = require('./utils.js')

const IDENTITY_BROKER = "idbroker.webex.com"
const SCOPE = "contact-center-context:pod_write contact-center-context:pod_read"
const KMS_SCOPES = 'webex-squared:kms_read webex-squared:kms_bind webex-squared:kms_write spark:kms'

const DEFAULT_ADMIN_SCOPE = "Identity:Organization webexsquare:admin squared-fusion-mgmt:management contact-center-context:pod_write contact-center-context:pod_read"
const CISCO_COOKIE_NAME = 'cisPRODiPlanetDirectoryPro'
const CISCO_COOKIE_DOMAIN = '.webex.com'

const OOB_CLIENT_ID = "C11d7d1e6aa4cf9b54871dddea9d99580c3a3e1204adc871fc90e8cb53f6d5403"
const OOB_CLIENT_SECRET = "857cb34de7f914c01b74cc442b103e086beb9a0505b926045e41c45c4babd4f7"

// only fetch token once
var tokenCache;
var orgAdminTokenCache;

// refresh the access_token
async function refreshAccessToken (connectionDataString, labMode = true, accessToken) {
	// decode the connection data string into JSON
	const connectionData = utils.decodeConnectionData(connectionDataString)
	// get credentials
	const credentials = utils.getCredentials(connectionData, labMode)
	// create auth header with credentials
	const authHeader = utils.getAuthHeader(credentials)
	// create HTTP headers
	const headers = {
		"Content-Type": "application/x-www-form-urlencoded",
		"Authorization": "Basic " + authHeader
		// "X-CiscoSpark-Allowed-Domains": "gmail.com"
	}
	const form = {
		grant_type: 'refresh_token',
		refresh_token: accessToken.refresh_token
		// self_contained_token: true
	}
	// url encode the form data
	const body = querystring.stringify(form)
	// console.log('form', form)
	const response = await request.post({
		url: `https://${connectionData.identityBrokerUrl}/idb/oauth2/v1/access_token`,
		body,
		headers
	})
	return JSON.parse(response)
}

async function getBearerToken (identityBrokerUrl, credentials) {
	// get credentials for lab mode or production mode
	const body = {
		name: credentials.name,
		password: credentials.password
	}
	const headers = {"Content-Type": "application/json"}
	const url = `https://${identityBrokerUrl}/idb/token/${credentials.orgId}/v2/actions/GetBearerToken/invoke`
	try {
		const response = await request.post({
			url,
			body: JSON.stringify(body),
			headers
		})
		const bearerToken = JSON.parse(response)["BearerToken"]
		// console.log('bearerToken', bearerToken)
		return bearerToken
	} catch (e) {
		throw e
	}
}

function getScopes (includeKmsScopes) {
	return includeKmsScopes ? [SCOPE, KMS_SCOPES].join(" ") : SCOPE
}

async function getAccessToken (credentials, identityBrokerUrl, includeKmsScopes){
	try {
		// decode the connection data string into JSON
		// const connectionData = utils.decodeConnectionData(connectionDataString)
		// get credentials
		// const credentials = utils.getCredentials(connectionData, labMode)
		// get bearer token
		const bearerToken = await getBearerToken(identityBrokerUrl, credentials)
		// create auth header with credentials
		const authHeader = utils.getAuthHeader(credentials)
		// get scopes list string
		const scopes = getScopes(includeKmsScopes)

		const form = {
			"grant_type": "urn:ietf:params:oauth:grant-type:saml2-bearer",
			"assertion": bearerToken,
			"scope": scopes
		}
		// format form data as x-www-form-urlencoded
		const body = querystring.stringify(form)

		const	headers = {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": "Basic " + authHeader,
			'Content-Length': body.length
		}

		const url = `https://${identityBrokerUrl}/idb/oauth2/v1/access_token`
		const response = await request.post({
			url,
			body,
			headers
		})
		return JSON.parse(response)
	} catch (e) {
		console.error(e)
		throw e.message || e
	}
}

function getOrgAdminToken (username, password, orgId, scopes){
	if (orgAdminTokenCache) {
		return Promise.resolve(orgAdminTokenCache);
	}
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
			reject(err.message);
		});
	});
}

async function listAccessTokens (connectionDataString, labMode) {
	try {
		// decode the connection data string into JSON
		const connectionData = utils.decodeConnectionData(connectionDataString)
		// get credentials
		const credentials = utils.getCredentials(connectionData, labMode)
		// create auth header with credentials
		const authHeader = utils.getAuthHeader(credentials)

		const	headers = {
			"Content-Type": "application/json",
			"Authorization": "Basic " + authHeader
		}
		const url = `https://${connectionData.identityBrokerUrl}/idb/oauth2/v1/tokens/me`
		const response = await request.get({
			url,
			headers
		})
		return JSON.parse(response)
	} catch (e) {
		console.error(e)
		throw e.message || e
	}
}

// async function getMachineAccount (connectionDataString, labMode) {
// 	/*
// 	GET https://identity.webex.com/organization/3f615378-d7e4-4a8f-a543-a09a7fea0a76/v1/Machines/12345678-164e-8793-abcd-abef98765432 HTTP/1.1
// 	Host: identity.webex.com
// 	Accept: application/json; charset=UTF-8
// 	Content-Type: application/json; charset=UTF-8
// 	Authorization: Bearer fd267432-c3ce-442a-b64b-23078946a445
// 	*/
// 	try {
// 		// decode the connection data string into JSON
// 		const connectionData = utils.decodeConnectionData(connectionDataString)
// 		// get credentials
// 		const credentials = utils.getCredentials(connectionData, labMode)
//
// 		const	headers = {
// 			"Content-Type": "application/json",
// 			"Authorization": "Bearer " + credentials.password
// 		}
//
// 		const url = `https://identity.webex.com/organization/${credentials.orgId}/v1/Machines/${credentials.cisUuid}`
// 		const response = await request.get({
// 			url,
// 			headers
// 		})
// 		return JSON.parse(response)
// 	} catch (e) {
// 		console.error(e)
// 		throw e.message || e
// 	}
// }

// createCustomer () {
// 	{
// 		"type": "activity",
// 		"state": "active",
// 		"mediaType": "chat",
// 		"customerRefUrl": "/context/v1/customer/14a6b520-3104-11e8-a313-370dc9fa70a9",
// 		"parentRefUrl": "/context/v1/request/fa58b2e0-3103-11e8-a313-370dc9fa70a9",
// 		"fieldsets": [
// 			"cisco.base.pod"
// 		],
// 		"contributors": [
// 			{
// 				"contributorType": "user",
// 				"username": "Sandra Jefferson",
// 				"id": "7dfd2dce-2b51-49c10-a9cf-be3bcda1abcf"
// 			}
// 		],
// 		"dataElements": [
// 			{
// 				"Context_Notes": "Example notes about a customer interaction.",
// 				"type": "string"
// 			},
// 			{
// 				"Context_POD_Activity_Link": "mlittlefoot@cumulus.com",
// 				"type": "string"
// 			},
// 			{
// 				"Context_POD_Source_Phone": "333-333-3333",
// 				"type": "string"
// 			}
// 		],
// 		"tags": [
// 			"Motorcycle Repair"
// 		]
// 	}
// }
module.exports = {
	getScopes,
	getBearerToken,
	getAccessToken,
	refreshAccessToken,
	getOrgAdminToken,
	listAccessTokens
	// getMachineAccount,
	// creatCustomer,
	// DEFAULT_JS_TEST_ORG : DEFAULT_ORG.orgId,
	// USER_CLIENT_ID : OOB_CLIENT_ID,
	// USER_CLIENT_SECRET : OOB_CLIENT_SECRET
};
