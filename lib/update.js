const chalk = require("chalk")
const request = require('request-promise-native')

function update ({type, id, body, token, labMode = true}) {
  const url = `https://cs-rest.produs1.ciscoccservice.com/context/v1/${type}/${id}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + token
  }
  console.log('adding body', body)
  return request({
    url,
    method: 'put',
    headers,
    body,
    json: true
  })
}

module.exports = update
