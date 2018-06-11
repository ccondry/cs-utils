const chalk = require("chalk")
const request = require('request-promise-native')

const dictionaryUri = 'https://dictionary.produs1.ciscoccservice.com/dictionary'

module.exports = {
  // create,
  get,
  search,
  // update,
  // remove
}

// function create ({type, body, token, labMode = true}) {
//   const url = `https://cs-rest.produs1.ciscoccservice.com/context/v1/${type}`
//
//   const headers = {
//     'cisco-context-labmode': '' + labMode,
//     'Authorization': 'Bearer ' + token
//   }
//
//   return request({
//     url,
//     method: 'post',
//     headers,
//     body,
//     json: true
//   })
// }

function get ({type, id, token, labMode = true}) {
  if (!['field', 'fieldset'].includes(type)) {
    throw `type must be set, and must be either 'field' or 'fieldset'`
  }
  const url = `${dictionaryUri}/${type}/v1/status/${id}`

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

// function remove ({type, id, token, labMode = true}) {
//   const url = `https://cs-rest.produs1.ciscoccservice.com/context/v1/${type}/${id}`
//
//   const headers = {
//     'cisco-context-labmode': '' + labMode,
//     'Authorization': 'Bearer ' + token
//   }
//
//   return request({
//     url,
//     method: 'delete',
//     headers,
//     json: true
//   })
// }

function search ({type, bearer, query = 'id:*', maxEntries = 1500}) {
  const url = `${dictionaryUri}/${type}/v1/search`

  const headers = {
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

// function update ({type, id, body, token, labMode = true}) {
//   const url = `https://cs-rest.produs1.ciscoccservice.com/context/v1/${type}/${id}`
//
//   const headers = {
//     'cisco-context-labmode': '' + labMode,
//     'Authorization': 'Bearer ' + token
//   }
//   console.log('adding body', body)
//   return request({
//     url,
//     method: 'put',
//     headers,
//     body,
//     json: true
//   })
// }
