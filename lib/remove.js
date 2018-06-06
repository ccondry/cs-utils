const chalk = require("chalk")
const request = require('request-promise-native')

function remove ({type, id, token, labMode = true}) {
  const url = `https://cs-rest.produs1.ciscoccservice.com/context/v1/${type}/${id}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + token
  }

  return request({
    url,
    method: 'delete',
    headers,
    json: true
  })
}

module.exports = remove
