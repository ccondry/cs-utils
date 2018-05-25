const auth = require("../index").Auth
const config = require('./config')

const connectionDataString = config.connectionDataString
const orgEmail = config.orgEmail
const orgPassword = config.orgPassword
const orgId = config.orgId
const labMode = true
const kmsScopes = true

const cache = {}

describe('auth.getOrgAdminToken(username, password, orgId, scopes)', function () {
  it('should get org admin token', function (done) {
    this.timeout(4000)
    auth.getOrgAdminToken(orgEmail, orgPassword, orgId)
    .then(response => {
      console.log('getOrgAdminToken', response)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('auth.decodeConnectionData(connectionDataString)', function () {
  it('should decode connection data string into JSON', function (done) {
    const connectionData = auth.decodeConnectionData(connectionDataString)
    console.log('decoded connection data', connectionData)
    cache.connectionData = connectionData
    done()
  })
})

describe('auth.getAccessToken(connectionData, labMode, includeKmsScopes)', function () {
  it('should get access token', function (done) {
    auth.getAccessToken(connectionDataString, true, true)
    .then(rsp => {
      console.log('access token:', rsp)
      cache.accessToken = rsp
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('refresh access token', function () {
  it('should refresh the access token received in the previous test', function (done) {
    // auth.refreshToken(cache.credentials, cache.token)
    auth.refreshAccessToken(connectionDataString, true, cache.accessToken)
    .then(rsp => {
      console.log('refreshed access token:', rsp)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})
