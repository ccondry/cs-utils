const request = require('request-promise')
const querystring = require('querystring')
const utils = require('./utils')

module.exports = {
  create,
  get,
  list,
  remove,
  setPassword,
  authorizeToCs,
  getBearerToken,
  getAccessToken,
  refreshAccessToken
}

function authorizeToCs ({orgId, machineAccountId, bearer}) {
  const url = `https://ccfs.produs1.ciscoccservice.com/v1/user/authorize`

  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Cache-Control': 'no-cache',
    'Authorization': 'Bearer ' + bearer
  }

  const body = {
    orgId,
    userId: machineAccountId,
    type: 'machine',
    workgroup: 'lab'
  }

  return request({
    url,
    method: 'POST',
    body: JSON.stringify(body),
    headers
  })
}

function setPassword ({orgId, machineAccountId, bearer, password}) {
  const url = `https://identity.webex.com/organization/${orgId}/v1/Machines/${machineAccountId}`

  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + bearer
  }

  const body = {
    password
  }

  return request({
    url,
    method: 'patch',
    body: JSON.stringify(body),
    headers
  })
}

// create machine account
function create ({orgId, bearer, name, password}) {
  const url = `https://identity.webex.com/organization/${orgId}/v1/Machines/`

  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + bearer
  }

  const body = {
    // name: 'Coty',
    // roles: [ 'spark.syncKms' ],
    // entitlements: [
    //   'contact-center-context',
    //   'spark',
    //   'spark-test-account',
    //   'squared-fusion-mgmt',
    //   'webex-squared'
    // ],
    name,
    password,
    machineType: 'bot'
  }

  return request({
    url,
    method: 'POST',
    body,
    headers,
    json: true
  })
}

// function setPassword ({
//   accessToken,
//   orgId,
//   machineAccountId,
//   newPassword
// }) {
//   const url = "https://identity.webex.com/organization/" + orgId + "/v1/Machines/" + machineAccountId
//
//   const headers = {
//     'Content-Type': 'application/json',
//     'Authorization': 'Bearer ' + accessToken
//   }
//
//   const args = {
//     "password":
//     newPassword
//   }
//
//   return request({
//     url,
//     method: 'patch',
//     body: JSON.stringify(args),
//     headers
//   })
// }

async function get ({orgId, machineAccountId, bearer}) {
  const url = `https://identity.webex.com/organization/${orgId}/v1/Machines/${machineAccountId}`

  const headers = {
    'Accept': 'application/json; charset=UTF-8',
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + bearer
  }

  try {
    const response = await request.get({
      url,
      headers
    })

    return JSON.parse(response)
  } catch (e) {
    throw e
  }
}

async function list ({orgId, bearer}) {
  const url = `https://identity.webex.com/organization/${orgId}/v1/Machines`

  const headers = {
    'Accept': 'application/json; charset=UTF-8',
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + bearer
  }

  try {
    const response = await request.get({
      url,
      headers
    })
    return JSON.parse(response)
  } catch (e) {
    throw e
  }
}

function getBearerToken ({name, password, orgId}) {
  // get credentials for lab mode or production mode
  const url = `https://idbroker.webex.com/idb/token/${orgId}/v2/actions/GetBearerToken/invoke`
  const headers = {"Content-Type": "application/json"}
  const body = {
    name,
    password
  }
  return request({
    url,
    method: 'POST',
    headers,
    body,
    json: true
  })
}

function getAccessToken ({
  clientId,
  clientSecret,
  bearerToken,
  includeKmsScopes = true
}) {
  // decode the connection data string into JSON
  // const connectionData = utils.decodeConnectionData(connectionDataString)
  // get credentials
  // const credentials = utils.getCredentials(connectionData, labMode)
  // get bearer token
  // const bearerToken = await getBearerToken(identityBrokerUrl, credentials)
  // create auth header with credentials
  const url = `https://idbroker.webex.com/idb/oauth2/v1/access_token`

  // set up access token permissions/scope
  const form = {
    "grant_type": "urn:ietf:params:oauth:grant-type:saml2-bearer",
    "assertion": bearerToken,
    "scope": utils.getScopes(includeKmsScopes)
  }

  // format form data as x-www-form-urlencoded
  const body = querystring.stringify(form)

  const	headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Authorization": "Basic " + utils.getAuthHeader({clientId, clientSecret}),
    'Content-Length': body.length
  }

  return request({
    url,
    method: 'POST',
    headers,
    body,
    json: true
  })
}

// refresh the access_token
function refreshAccessToken ({clientId, clientSecret, refreshToken}) {
  // create HTTP headers
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Authorization": "Basic " + utils.getAuthHeader({clientId, clientSecret})
  }
  const form = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken
    // self_contained_token: true
  }
  // url encode the form data
  const body = querystring.stringify(form)
  // console.log('form', form)
  return request({
    url: `https://idbroker.webex.com/idb/oauth2/v1/access_token`,
    method: 'POST',
    body,
    headers,
    json: true
  })
}

function remove ({orgId, machineAccountId, bearer}) {
  const url = `https://identity.webex.com/organization/${orgId}/v1/Machines/${machineAccountId}`

  const headers = {
    'Accept': 'application/json; charset=UTF-8',
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + bearer
  }

  return request({
    url,
    method: 'DELETE',
    headers,
    json: true
  })
}
