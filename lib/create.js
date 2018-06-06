const chalk = require("chalk")
const request = require('request-promise-native')

function create ({type, body, token, labMode = true}) {
  const url = `https://cs-rest.produs1.ciscoccservice.com/context/v1/${type}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + token
  }

  return request({
    url,
    method: 'post',
    headers,
    body,
    json: true
  })
}

module.exports = create
