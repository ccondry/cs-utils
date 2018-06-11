const request = require('request-promise-native')

const contextUri = 'https://cs-rest.produs1.ciscoccservice.com/context'

module.exports = {
  getStatus
}

function getStatus () {
  const url = `${contextUri}/v1/ping`

  return request({
    url,
    method: 'GET',
    json: true
  })
}
