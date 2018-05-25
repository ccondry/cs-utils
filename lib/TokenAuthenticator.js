'use strict';

var Promise = require('es6-promise').Promise,
request = require('request-promise'),
DEFAULT_ORG = require('./TestUsers.js');
const querystring = require('querystring')

var IDENTITY_BROKER = "idbroker.webex.com",
SCOPE = "contact-center-context:pod_write contact-center-context:pod_read",
KMS_SCOPES = 'webex-squared:kms_read webex-squared:kms_bind webex-squared:kms_write spark:kms';

var DEFAULT_ADMIN_SCOPE = "Identity:Organization webexsquare:admin squared-fusion-mgmt:management contact-center-context:pod_write contact-center-context:pod_read",
OOB_CLIENT_ID = "C11d7d1e6aa4cf9b54871dddea9d99580c3a3e1204adc871fc90e8cb53f6d5403",
OOB_CLIENT_SECRET = "857cb34de7f914c01b74cc442b103e086beb9a0505b926045e41c45c4babd4f7",
CISCO_COOKIE_NAME = 'cisPRODiPlanetDirectoryPro',
CISCO_COOKIE_DOMAIN = '.webex.com'
;
// only fetch token once
var tokenCache;
var orgAdminTokenCache;

// refresh the access_token
function refreshAccessToken (connectionDataString, labMode = true, accessToken) {
	/*
	POST /idb/oauth2/v1/access_token  HTTP/1.1

	Host: idbroker.webex.com
	Content-Type: application/x-www-form-urlencoded
	Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
	TrackingID:NA_a8804f02-410a-4ea4-8ff9-4f3a5cbf8db7

	grant_type=refresh_token
	&refresh_token=ZDI3MGEyYzQtNmFlNS00NDNhLWFlNzAtZGVjNjE0MGU1OGZmZWNmZDEwN2ItYTU3
	&self_contained_token=true
	*/
	// const scopes = includeKmsScopes ? [SCOPE, KMS_SCOPES].join(" ") : SCOPE;

	// decode the connection data string into JSON
	const connectionData = decodeConnectionData(connectionDataString)
	// get credentials
	const credentials = getCredentials(connectionData, labMode)
	// create auth header with credentials
	const authHeader = getAuthHeader(credentials)
	// create HTTP headers
	const headers = {
		"Content-Type": "application/x-www-form-urlencoded",
		"Authorization": "Basic " + authHeader,
		"X-CiscoSpark-Allowed-Domains": "gmail.com"
	}
	const form = {
		grant_type: 'refresh_token',
		refresh_token: accessToken.refresh_token
		// self_contained_token: true
	}
	// url encode the form data
	const body = querystring.stringify(form)
	console.log('form', form)
	return request.post({
		url: `https://${connectionData.identityBrokerUrl}/idb/oauth2/v1/access_token`,
		body,
		headers
	})
}

// decode connection data from base64 string into JSON
function decodeConnectionData (connectionDataString) {
	const buff = new Buffer(connectionDataString, 'base64')
	const text = buff.toString('ascii')
	const connectionData = JSON.parse(text)
	return connectionData
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
		return bearerToken
	} catch (e) {
		throw e
	}
}

function getCredentials (connectionData, labMode) {
	return labMode ? connectionData.credentials : connectionData.credentialsLabMode
}

function getAuthHeader (credentials) {
	return new Buffer(credentials.clientId + ":" + credentials.clientSecret).toString("base64")
}

function getScopes (includeKmsScopes) {
	return includeKmsScopes ? [SCOPE, KMS_SCOPES].join(" ") : SCOPE
}

async function getAccessToken (connectionDataString, labMode, includeKmsScopes){
	try {
		// decode the connection data string into JSON
		const connectionData = decodeConnectionData(connectionDataString)
		// get credentials
		const credentials = getCredentials(connectionData, labMode)
		// get bearer token
		const bearerToken = await getBearerToken(connectionData.identityBrokerUrl, credentials)
		// create auth header with credentials
		const authHeader = getAuthHeader(credentials)
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

		const url = `https://${connectionData.identityBrokerUrl}/idb/oauth2/v1/access_token`
		const accessToken = await request.post({
			url,
			body,
			headers
		})
		return accessToken
	} catch (e) {
		console.error(e)
		throw e.message || e
	}
}

function getOrgAdminToken (username, password, orgId, scopes){
	if (orgAdminTokenCache) {
		return Promise.resolve(orgAdminTokenCache);
	}
	username = username || DEFAULT_ORG.adminUser;
	password = password || DEFAULT_ORG.adminPassword;
	orgId = orgId || DEFAULT_ORG.orgId;
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

module.exports = {
	decodeConnectionData,
	getCredentials,
	getBearerToken,
	getAuthHeader,
	getScopes,
	getAccessToken,
	refreshAccessToken,
	getOrgAdminToken,
	DEFAULT_JS_TEST_ORG : DEFAULT_ORG.orgId,
	USER_CLIENT_ID : OOB_CLIENT_ID,
	USER_CLIENT_SECRET : OOB_CLIENT_SECRET
};
