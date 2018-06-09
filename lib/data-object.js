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

function get ({type, id, token, labMode = true}) {
  const url = `https://cs-rest.produs1.ciscoccservice.com/context/v1/${type}/${id}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + token
  }

  return request({
    url,
    method: 'get',
    headers,
    json: true
  })
}

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

module.exports = {
  create,
  get,
  search,
  update,
  remove
}
