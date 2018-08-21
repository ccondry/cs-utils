const request = require('request-promise-native')

const contextUri = 'https://cs-rest.produs1.ciscoccservice.com/context'

// allowed data type options
const types = ['customer', 'request', 'activity', 'workitem', 'detail']

async function create ({type, body, bearer, labMode = true}) {
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `${contextUri}/v1/${type}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + bearer
  }

  const response = await request({
    url,
    method: 'post',
    headers,
    body,
    json: true,
    resolveWithFullResponse: true
  })
  const ret = response.body || {}
  ret.trackingId = response.headers.trackingid
  return ret
}

async function get ({type, id, bearer, labMode = true}) {
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `${contextUri}/v1/${type}/${id}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + bearer
  }

  const response = await request({
    url,
    method: 'get',
    headers,
    json: true,
    resolveWithFullResponse: true
  })
  const ret = response.body || {}
  ret.trackingId = response.headers.trackingid
  return ret
}

async function remove ({type, id, bearer, labMode = true}) {
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `${contextUri}/v1/${type}/${id}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + bearer
  }

  const response = await request({
    url,
    method: 'delete',
    headers,
    json: true,
    resolveWithFullResponse: true
  })
  const ret = response.body || {}
  ret.trackingId = response.headers.trackingid
  return ret
}

async function search ({type, query, bearer, labMode = true}) {
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `${contextUri}/v1/${type}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + bearer
  }
  // query string
  let qs
  if (typeof query === 'string') {
    // query is a string - put it into the querysting object
    qs = {
      q: query
    }
  } else if (typeof query === 'object') {
    // query is an object - just use it directly for the querystring
    qs = query
  } else {
    // no query defined, or unsupported type - just search for all of this type
    qs = {
      q: 'type:' + type
    }
  }
  const response = await request({
    url,
    method: 'get',
    headers,
    qs,
    json: true,
    resolveWithFullResponse: true
  })
  const ret = response.body || {}
  ret.trackingId = response.headers.trackingid
  return ret
}

async function update ({type, id, body, bearer, labMode = true}) {
  if (!types.includes(type)) {
    throw `type must be set, and must be one of ${types.join(', ')}`
  }
  const url = `${contextUri}/v1/${type}/${id}`

  const headers = {
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + bearer
  }
  // console.log('adding body', body)
  const response = await request({
    url,
    method: 'put',
    headers,
    body,
    json: true,
    resolveWithFullResponse: true
  })
  const ret = response.body || {}
  ret.trackingId = response.headers.trackingid
  return ret
}

module.exports = {
  create,
  get,
  search,
  update,
  remove
}
