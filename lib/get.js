const chalk = require("chalk")
const request = require('request-promise-native')

async function get ({type, id, token, labMode = true}) {
  const url = `https://cs-rest.produs1.ciscoccservice.com/context/v1/${type}/${id}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + token
  }

  const results = await request({
    url,
    method: 'get',
    headers
  })

  return JSON.parse(results)
}

module.exports = get
