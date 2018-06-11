const chalk = require("chalk")
const request = require('request-promise-native')

// allowed data type options
const types = ['customer', 'request', 'activity', 'workitem', 'detail']

function create ({type, body, bearer, labMode = true}) {
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `https://cs-rest.produs1.ciscoccservice.com/context/v1/${type}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + bearer
  }

  return request({
    url,
    method: 'post',
    headers,
    body,
    json: true
  })
}

function get ({type, id, bearer, labMode = true}) {
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `https://cs-rest.produs1.ciscoccservice.com/context/v1/${type}/${id}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + bearer
  }

  return request({
    url,
    method: 'get',
    headers,
    json: true
  })
}

function remove ({type, id, bearer, labMode = true}) {
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `https://cs-rest.produs1.ciscoccservice.com/context/v1/${type}/${id}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + bearer
  }

  return request({
    url,
    method: 'delete',
    headers,
    json: true
  })
}

function search ({type, query, bearer, labMode = true}) {
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `https://cs-rest.produs1.ciscoccservice.com/context/v1/${type}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + bearer
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

function update ({type, id, body, bearer, labMode = true}) {
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `https://cs-rest.produs1.ciscoccservice.com/context/v1/${type}/${id}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + bearer
  }
  // console.log('adding body', body)
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
