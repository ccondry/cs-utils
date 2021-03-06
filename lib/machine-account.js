const request = require('request-promise-native')
const utils = require('./utils')

const idBrokerUri = 'https://idbroker.webex.com/idb'
const identityUri = 'https://identity.webex.com/'
const ccfsUri = 'https://ccfs.produs1.ciscoccservice.com/v1'

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
  const url = `${ccfsUri}/user/authorize`

  const headers = {
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
    body,
    headers,
    json: true
  })
}

function setPassword ({orgId, machineAccountId, bearer, password}) {
  const url = `${identityUri}/organization/${orgId}/v1/Machines/${machineAccountId}`

  const headers = {
    'Authorization': 'Bearer ' + bearer
  }

  const body = {
    password
  }

  return request({
    url,
    method: 'PATCH',
    body,
    headers,
    json: true
  })
}

// create machine account
function create ({orgId, bearer, name, password}) {
  const url = `${identityUri}/organization/${orgId}/v1/Machines/`

  const headers = {
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

function get ({orgId, machineAccountId, bearer}) {
  const url = `${identityUri}/organization/${orgId}/v1/Machines/${machineAccountId}`

  const headers = {
    'Authorization': 'Bearer ' + bearer
  }

  return request({
    url,
    method: 'GET',
    headers,
    json: true
  })
}

function list ({orgId, bearer}) {
  const url = `${identityUri}/organization/${orgId}/v1/Machines`

  const headers = {
    'Authorization': 'Bearer ' + bearer
  }

  return request({
    url,
    method: 'GET',
    headers,
    json: true
  })
}

function getBearerToken ({name, password, orgId}) {
  // get credentials for lab mode or production mode
  const url = `${idBrokerUri}/token/${orgId}/v2/actions/GetBearerToken/invoke`
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
  // create auth header with credentials
  const url = `${idBrokerUri}/oauth2/v1/access_token`

  // set up access token permissions/scope
  const form = {
    "grant_type": "urn:ietf:params:oauth:grant-type:saml2-bearer",
    "assertion": bearerToken,
    "scope": utils.getScopes(includeKmsScopes)
  }

  const	headers = {
    "Authorization": "Basic " + utils.getAuthHeader({clientId, clientSecret})
  }

  return request({
    url,
    method: 'POST',
    headers,
    form,
    json: true
  })
}

// refresh the access_token
function refreshAccessToken ({clientId, clientSecret, refreshToken}) {
  // create HTTP headers
  const headers = {
    "Authorization": "Basic " + utils.getAuthHeader({clientId, clientSecret})
  }
  const form = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken
    // self_contained_token: true
  }
  // url encode the form data
  return request({
    url: `${idBrokerUri}/oauth2/v1/access_token`,
    method: 'POST',
    form,
    headers,
    json: true
  })
}

function remove ({orgId, machineAccountId, bearer}) {
  const url = `${identityUri}/organization/${orgId}/v1/Machines/${machineAccountId}`

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
