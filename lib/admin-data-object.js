const chalk = require("chalk")
const request = require('request-promise-native')

// allowed data type options
const types = ['field', 'fieldset']
const dictionaryUri = 'https://dictionary.produs1.ciscoccservice.com/dictionary'

module.exports = {
  create,
  get,
  search,
  update,
  remove
}

function create ({type, body, bearer}) {
  // validate request
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `${dictionaryUri}/${type}/v1`

  const headers = {
    'Authorization': 'Bearer ' + bearer
  }

  return request({
    url,
    method: 'POST',
    headers,
    body,
    json: true
  })
}

function get ({type, id, bearer}) {
  // validate request
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `${dictionaryUri}/${type}/v1/id/${id}`

  const headers = {
    'Authorization': 'Bearer ' + bearer
  }

  return request({
    url,
    method: 'GET',
    headers,
    json: true
  })
}

function getStatus ({type, id, bearer}) {
  // validate request
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `${dictionaryUri}/${type}/v1/status/${id}`

  const headers = {
    'Authorization': 'Bearer ' + bearer
  }

  return request({
    url,
    method: 'GET',
    headers,
    json: true
  })
}

function remove ({type, id, bearer}) {
  // validate request
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `${dictionaryUri}/${type}/v1/id/${id}`

  const headers = {
    'Authorization': 'Bearer ' + bearer
  }

  return request({
    url,
    method: 'DELETE',
    headers,
    json: true
  })
}

function search ({type, bearer, query = 'id:*', maxEntries = 1500}) {
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `${dictionaryUri}/${type}/v1/search`

  const headers = {
    'Authorization': 'Bearer ' + bearer
  }

  return request({
    url,
    method: 'GET',
    headers,
    qs: {
      maxEntries,
      q: query
    },
    json: true
  })
}

function update ({type, id, body, bearer}) {
  // validate request
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `${dictionaryUri}/${type}/v1/id/${id}`

  const headers = {
    'Authorization': 'Bearer ' + bearer
  }

  return request({
    url,
    method: 'PUT',
    headers,
    body,
    json: true
  })
}
