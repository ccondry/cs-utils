const request = require('request-promise-native')
const utils = require('./utils')

const ID_SCOPES = 'Identity:SCIM Identity:Config Identity:Organization Identity:OAuthToken'
const CC_SCOPES = 'contact-center-context:pod_write contact-center-context:pod_read'
const DEFAULT_ADMIN_SCOPE = `${ID_SCOPES} ${CC_SCOPES} webexsquare:admin squared-fusion-mgmt:management spark:kms`
const CISCO_COOKIE_NAME = 'cisPRODiPlanetDirectoryPro'
const CISCO_COOKIE_DOMAIN = '.webex.com'

module.exports = {
  onboard,
  migrate,
  getAdminAccessToken,
  listAccessTokens
}

// onboard org with CS Onboarding
function onboard ({orgId, bearer}) {
  const url = `https://ccfs.produs1.ciscoccservice.com/v1/onboard/`

  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Cache-Control': 'no-cache',
    'Authorization': 'Bearer ' + bearer
  }

  const body = {
    orgId
  }

  return request({
    url,
    method: 'POST',
    body,
    headers,
    json: true
  })
}

// migrate org with CS Onboarding
function migrate ({orgId, bearer}) {
  const url = `https://ccfs.produs1.ciscoccservice.com/v1/migrate/`

  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Cache-Control': 'no-cache',
    'Authorization': 'Bearer ' + bearer
  }

  const body = {
    orgId
  }

  return request({
    url,
    method: 'POST',
    body,
    headers,
    json: true
  })
}

function getAdminAccessToken({username, password, clientId, clientSecret, orgId, scopes}){
  // if (orgAdminTokenCache) {
  //   return Promise.resolve(orgAdminTokenCache);
  // }
  // username = username || DEFAULT_ORG.adminUser;
  // password = password || DEFAULT_ORG.adminPassword;
  // orgId = orgId || DEFAULT_ORG.orgId;
  var scopes = scopes || DEFAULT_ADMIN_SCOPE;
  return new Promise(function (resolve, reject) {
    request.post({
      url: "https://idbroker.webex.com/idb/UI/Login",
      qs: {org: orgId},
      form: {
        "IDToken1": username,
        "IDToken2": password
      }
    })
    .catch(function (error) {
      var ciscoCookie = error.response.headers['set-cookie'].find(function(cookie){
        return cookie.indexOf(CISCO_COOKIE_NAME) ==0 && cookie.indexOf(CISCO_COOKIE_DOMAIN) >0
      });

      var cookieVal = ciscoCookie.split(CISCO_COOKIE_NAME + "=")[1].split(';')[0];
      var cookieJar = request.jar();
      cookieJar.setCookie(`${CISCO_COOKIE_NAME}=${cookieVal} ; path=/; domain=${CISCO_COOKIE_DOMAIN}`, 'https://idbroker.webex.com/');

      return request({
        url: 'https://idbroker.webex.com/idb/oauth2/v1/authorize',
        method: 'GET',
        jar: cookieJar,
        qs: {
          "response_type": "code",
          "redirect_uri": "urn:ietf:wg:oauth:2.0:oob",
          "client_id": clientId,
          "scope" : scopes,
          // "realm" : "/"+orgId,
          "state" : new Date().getTime(),
          cisService: "common"
        }
      })
    })
    .then(function (resp) {
      var title = resp.match(/<title>(.*)</)
      if (!title) {
        reject(new Error('Failed to get auth code from response title.'))
      }
      return request({
        url: "https://idbroker.webex.com/idb/oauth2/v1/access_token",
        method: 'post',
        form: {
          "grant_type": "authorization_code",
          "redirect_uri": "urn:ietf:wg:oauth:2.0:oob",
          "scope": scopes,
          "code": title[1]
        },
        headers: {
          "Authorization": "Basic " + utils.getAuthHeader({clientId, clientSecret}),
        },
        json: true
      })
    })
    .then(function(response){
      resolve(response)
    })
    .catch(function(err){
      reject(err.message)
    })
  })
}

// async function getAdminAccessToken ({
//   username,
//   password,
//   orgId,
//   scopes = DEFAULT_ADMIN_SCOPE
// }) {
//   try {
//     // try simple login
//     // const login = await request({
//     //   url: `https://idbroker.webex.com/idb/UI/Login`,
//     //   method: 'POST',
//     //   form: {
//     //     "IDToken1": username,
//     //     "IDToken2": password
//     //   },
//     //   headers: {
//     //     "Content-Type": "application/x-www-form-urlencoded"
//     //   },
//     //   qs: {
//     //     org: orgId
//     //   }
//     // })
//
//     const qs = {
//       "response_type": "code",
//       "redirect_uri": "urn:ietf:wg:oauth:2.0:oob",
//       "client_id":clientId,
//       "scope" : scopes,
//       "realm" : "/"+orgId,
//       "state" : new Date().getTime()
//     }
//
//     const login = await request(
//       url: 'https://idbroker.webex.com/idb/oauth2/v1/authorize'
//       method: 'GET',
//       jar: cookieJar,
//       qs
//     })
//
//
//     // we have logged in - get the auth code
//     let title = login.match(/<title>(.*)</)
//     if (!title) {
//       throw new Error('Failed to get auth code from response title.')
//     }
//     let code = title[1]
//
//     // create access token using auth code, client ID, and client secret
//     return request({
//       url: 'https://idbroker.webex.com/idb/oauth2/v1/access_token',
//       method: 'POST',
//       form: {
//         "grant_type": "authorization_code",
//         "redirect_uri": "urn:ietf:wg:oauth:2.0:oob",
//         "code": code
//       },
//       headers: {
//         "Content-Type" : "application/x-www-form-urlencoded",
//         "Authorization": "Basic " + utils.getAuthHeader({clientId, clientSecret})
//       },
//       json: true
//     })
//   } catch (e) {
//     throw new Error(`Failed to log in with org admin username ${username}`, e.message)
//   }
// }

// function getAdminAccessToken ({
//   username,
//   password,
//   clientId,
//   clientSecret,
//   orgId,
//   scopes = DEFAULT_ADMIN_SCOPE
// }) {
//   return new Promise(function (resolve, reject) {
//     var args = {
//       parameters: {
//         "IDToken1": username,
//         "IDToken2": password
//       },
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded"
//       }
//     }
//     request.post("https://idbroker.webex.com/idb/UI/Login?org="+orgId,{
//       form: args.parameters,
//       headers: args.headers
//     })
//     .catch(function (error) {
//       var ciscoCookie = error.response.headers['set-cookie'].find(function(cookie){
//         return cookie.indexOf(CISCO_COOKIE_NAME) ==0 && cookie.indexOf(CISCO_COOKIE_DOMAIN) >0
//       })
//
//       var  cookieVal = ciscoCookie.split(CISCO_COOKIE_NAME + "=")[1].split(';')[0]
//       var cookieJar = request.jar()
//       cookieJar.setCookie('cisPRODiPlanetDirectoryPro=' + cookieVal + ' ; path=/; domain=.webex.com', 'https://idbroker.webex.com/')
//
//       var args = {
//         parameters: {
//           "response_type": "code",
//           "redirect_uri": "urn:ietf:wg:oauth:2.0:oob",
//           "client_id": clientId,
//           "scope" : scopes,
//           "realm" : "/"+orgId,
//           "state" : new Date().getTime()
//         }
//       }
//       return request.get("https://idbroker.webex.com/idb/oauth2/v1/authorize", {
//         jar:cookieJar,
//         qs: args.parameters
//       })
//     })
//     .then(function(resp){
//       var title = resp.match(/<title>(.*)</)
//       if (!title) {
//         reject( new Error('Failed to get auth code from response title.'))
//       }
//       var code= title[1],
//       authHeader = new Buffer(clientId + ":" + clientSecret).toString("base64"),
//       args = {
//         parameters: {
//           "grant_type": "authorization_code",
//           "redirect_uri": "urn:ietf:wg:oauth:2.0:oob",
//           "code":code
//         },
//         headers: {
//           "Content-Type" : "application/x-www-form-urlencoded",
//           "Authorization": "Basic "+authHeader,
//         }
//       }
//       return request("https://idbroker.webex.com/idb/oauth2/v1/access_token", {
//         method: 'post',
//         form: args.parameters,
//         headers: args.headers
//       })
//     })
//     .then(function(response){
//       orgAdminTokenCache = JSON.parse(response)
//       resolve(orgAdminTokenCache)
//     })
//     .catch(function(err){
//       reject(err.message)
//     })
//   })
// }


// list access tokens
function listAccessTokens (credentials, labMode) {
  const url = `https://idbroker.webex.com/idb/oauth2/v1/tokens/me`

  const	headers = {
    "Content-Type": "application/json",
    "Authorization": "Basic " + utils.getAuthHeader(credentials)
  }

  return request({
    url,
    method: 'GET',
    headers,
    json: true
  })
}