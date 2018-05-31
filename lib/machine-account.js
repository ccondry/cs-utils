const request = require('request-promise')

module.exports = {
  create,
  get,
  list
}

// create machine account
function create () {
  // https://<server name>/organization/{orgId}/v1/Machines
}

function setPassword ({
  accessToken,
  orgId,
  machineAccountId,
  newPassword
}) {
	const url = "https://identity.webex.com/organization/" + orgId + "/v1/Machines/" + machineAccountId

	const headers = {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + accessToken
	}

	const args = {
    "password":
    newPassword
  }

	return request({
    url,
		method: 'patch',
		body: JSON.stringify(args),
		headers
	})
}

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
