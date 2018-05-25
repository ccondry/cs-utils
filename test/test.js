const auth = require("../index").Auth
const config = require('./config')

const connectionDataString = config.connectionDataString
const orgEmail = config.orgEmail
const orgPassword = config.orgPassword
const orgId = config.orgId
const labMode = true
const kmsScopes = true

const cache = {}

describe('auth.decodeConnectionData(connectionData)', function () {
  it('should decode connection data string into JSON', function (done) {
    // const buff = new Buffer(connectionData, 'base64')
    // const text = buff.toString('ascii')
    // const json = JSON.parse(text)
    // const credentials = labMode ? json.credentials : json.credentialsLabMode
    // console.log('orgId', credentials.orgId)
    // auth.getToken(credentials.name, credentials.password, credentials.orgId, kmsScopes)
    // .then(rsp => {
    //   console.log('got access token:', rsp)
    //   cache.credentials = credentials
    //   cache.token = rsp
    //   done()
    // })
    // .catch(e => {
    //   done(e)
    // })
    const json = auth.decodeConnectionData(connectionData)
    console.log('decoded connection data', json)
    cache.connectionData = json
    done()
  })
})

describe('getAccessToken(connectionData, labMode, includeKmsScopes)', function () {
  it('should get access token', function (done) {
    auth.getAccessToken(connectionData, true, true)
    .then(rsp => {
      console.log('access token:', rsp)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})


// describe('refresh access token', function () {
//   it('should refresh the access token received in the previous test', function (done) {
//     // auth.refreshToken(cache.credentials, cache.token)
//     auth.refreshToken(cache.credentials, cache.token)
//     .then(rsp => {
//       console.log('refreshed access token:', rsp)
//       done()
//     })
//     .catch(e => {
//       done(e)
//     })
//   })
// })
