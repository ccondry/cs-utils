const request = require('request-promise')

module.exports = {
  create,
  get,
  list,
  setPassword
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
function create ({orgId, bearer}) {
  const url = `https://identity.webex.com/organization/${orgId}/v1/Machines/`

  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + bearer
  }

  const body = {
    name: 'Coty',
    roles: [ 'spark.syncKms' ],
    entitlements: [
      'contact-center-context',
      'spark',
      'spark-test-account',
      'squared-fusion-mgmt',
      'webex-squared'
    ],
    machineType: 'bot'
  }

  return request({
    url,
    method: 'post',
    body: JSON.stringify(body),
    headers
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

async function get ({orgId, machineId, bearer}) {
  const url = `https://identity.webex.com/organization/${orgId}/v1/Machines/${machineId}`

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
