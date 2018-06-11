const request = require('request-promise-native')
const utils = require('./utils')

const ID_SCOPES = 'Identity:SCIM Identity:Config Identity:Organization Identity:OAuthToken'
const CC_SCOPES = 'contact-center-context:pod_write contact-center-context:pod_read'
const DEFAULT_ADMIN_SCOPE = `${ID_SCOPES} ${CC_SCOPES} webexsquare:admin squared-fusion-mgmt:management spark:kms`
const CISCO_COOKIE_NAME = 'cisPRODiPlanetDirectoryPro'
const CISCO_COOKIE_DOMAIN = '.webex.com'

const idBrokerUri = 'https://idbroker.webex.com/idb'
const ccfsUri = 'https://ccfs.produs1.ciscoccservice.com/v1'

module.exports = {
  onboard,
  migrate,
  getAdminAccessToken,
  listAccessTokens
}

// onboard org with CS Onboarding
function onboard ({orgId, bearer}) {
  const url = `${ccfsUri}/onboard/`

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
  const url = `${ccfsUri}/migrate/`

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
  var scopes = scopes || DEFAULT_ADMIN_SCOPE;
  return new Promise(function (resolve, reject) {
    request.post({
      url: `${idBrokerUri}/UI/Login`,
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
        url: `${idBrokerUri}/oauth2/v1/authorize`,
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
        url: `${idBrokerUri}/oauth2/v1/access_token`,
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

// list access tokens
function listAccessTokens ({orgId, username, clientId, bearer}) {
  // const url = `https://idbroker.webex.com/idb/oauth2/v1/tokens/me`
  const url = `${idBrokerUri}/oauth2/v1/tokens`

  const qs = {
    orgid: orgId,
    username,
    clientid: clientId
  }
  
  const	headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + bearer
  }

  return request({
    url,
    method: 'GET',
    headers,
    qs,
    json: true
  })
}
