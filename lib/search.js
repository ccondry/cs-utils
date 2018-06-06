const chalk = require("chalk")
const request = require('request-promise-native')

function search ({type, query, token, labMode = true}) {
  const url = `https://cs-rest.produs1.ciscoccservice.com/context/v1/${type}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + token
  }

  return request({
    url,
    method: 'get',
    headers,
    qs: {
      q: query
    },
    json: true
  })
}

module.exports = search