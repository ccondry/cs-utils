const lib = require('../lib')
const config = require('./config')

// get initial config for tests
const cache = {
  // orgId: config.orgId,
  connectionDataString: config.connectionDataString,
  orgUsername: config.orgUsername,
  orgPassword: config.orgPassword,
  labMode: config.labMode,
  // clientId: config.clientId,
  // clientSecret: config.clientSecret
  // adminBearer: config.adminBearer
}

console.log('org admin username', cache.orgUsername)
console.log('lab mode', cache.labMode)
// console.log('connection data string', cache.connectionDataString)

describe('lib.utils.decodeConnectionData()', function () {
  it('should decode connection data string into JSON', function (done) {
    try {
      cache.connectionData = lib.utils.decodeConnectionData(cache.connectionDataString)
      done()
    } catch (e) {
      done(`could not decoded connection string data`, e)
    }
  })
})

describe('lib.utils.getCredentials()', function () {
  it('should extract labMode credentials from decoded connectionData string', function (done) {
    const credentials = lib.utils.getCredentials(cache.connectionData, cache.labMode)
    // check that we got the lab mode credentials
    if (credentials !== cache.connectionData.credentialsLabMode) {
      done('credentials extracted were not the correct ones. got', credentials)
    } else {
      // cache the relevant data
      cache.clientId = credentials.clientId
      cache.clientSecret = credentials.clientSecret
      cache.orgId = credentials.orgId
      done()
    }
  })
})

describe('lib.org.getAdminAccessToken({username, password, orgId, scopes})', function () {
  it('should get org admin token', function (done) {
    this.timeout(8000)
    lib.org.getAdminAccessToken({
      username: cache.orgUsername,
      password: cache.orgPassword,
      orgId: cache.orgId,
      clientId: cache.clientId,
      clientSecret: cache.clientSecret,
    })
    .then(response => {
      // console.log('getOrgAdminToken', response)
      cache.adminBearer = response.access_token
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.org.onboard()', function () {
  it('should onboard org with Context Service', function (done) {
    this.timeout(8000)
    lib.org.onboard({
      orgId: cache.orgId,
      bearer: cache.adminBearer
    })
    .then(rsp => {
      done()
    })
    .catch(e => {
      if (e.statusCode === 400) {
        // this is OK - means it is done already
        console.log(e.message)
        return done()
      }
      done(e)
    })
  })
})

describe('lib.org.migrate()', function () {
  it('should migrate org with Context Service', function (done) {
    this.timeout(8000)
    lib.org.migrate({
      orgId: cache.orgId,
      bearer: cache.adminBearer
    })
    .then(rsp => {
      done()
    })
    .catch(e => {
      if (e.statusCode === 400) {
        // this is OK - means it is done already
          console.log(e.message)
        return done()
      }
      done(e)
    })
  })
})

describe('lib.machineAccount.create()', function () {
  it('should create machine account', function (done) {
    // increase mocha timeout to 8 seconds
    this.timeout(8000)
    // generate machine account name for test
    cache.machineAccountName = 'cs-utils-mocha-' + (Math.random() * 1000000 | 0)
    // generate machine account password
    cache.machineAccountPassword = lib.utils.generatePassword()
    // create machine account with new name and password
    lib.machineAccount.create({
      orgId: cache.orgId,
      bearer: cache.adminBearer,
      name: cache.machineAccountName,
      password: cache.machineAccountPassword
    })
    .then(rsp => {
      console.log('new machine account id', rsp.id)
      cache.machineAccountId = rsp.id
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.machineAccount.setPassword()', function () {
  const password = lib.utils.generatePassword()
  it('should set Machine Account password', function (done) {
    lib.machineAccount.setPassword({
      orgId: cache.orgId,
      machineAccountId: cache.machineAccountId,
      bearer: cache.adminBearer,
      password
    })
    .then(rsp => {
      console.log(`set machine account ${cache.machineAccountId} password to ${password}:`)
      cache.machineAccountPassword = password
      done()
    })
    .catch(e => {
      console.error(e)
      done(e)
    })
  })
})

describe('lib.machineAccount.list()', function () {
  it('should list Context Service machine accounts', function (done) {
    // get machine account list
    lib.machineAccount.list({
      orgId: cache.orgId,
      bearer: cache.adminBearer
    })
    .then(rsp => {
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.machineAccount.get()', function () {
  it('should get Context Service machine account', function (done) {
    // get machine account
    lib.machineAccount.get({
      orgId: cache.orgId,
      bearer: cache.adminBearer,
      machineAccountId: cache.machineAccountId
    })
    .then(rsp => {
      // console.log('machine account:', rsp)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.machineAccount.authorizeToCs()', function () {
  it('should authorize machine account to use CS', function (done) {
    this.timeout(8000)
    lib.machineAccount.authorizeToCs({
      orgId: cache.orgId,
      bearer: cache.adminBearer,
      machineAccountId: cache.machineAccountId
    })
    .then(rsp => {
      // console.log('authorized to CS:', rsp)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.machineAccount.getBearerToken()', function () {
  it('should get bearer token using machine account', function (done) {
    this.timeout(8000)
    lib.machineAccount.getBearerToken({
      name: cache.machineAccountName,
      password: cache.machineAccountPassword,
      orgId: cache.orgId
    })
    .then(rsp => {
      // console.log('got bearer token:', rsp.BearerToken)
      cache.machineBearer = rsp.BearerToken
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.machineAccount.getAccessToken()', function () {
  it('should get access token using org client ID, client secret, and machine bearer token', function (done) {
    this.timeout(8000)
    lib.machineAccount.getAccessToken({
      clientId: cache.clientId,
      clientSecret: cache.clientSecret,
      bearerToken: cache.machineBearer
    })
    .then(rsp => {
      // console.log('access token:', rsp)
      cache.accessToken = rsp
      // console.log('accessToken', rsp)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.search()', function () {
  it('should search for data object in Context Service', function (done) {
    this.timeout(8000)
    lib.dataObject.search({
      type: 'customer',
      query: 'Context_Last_Name:Condry',
      token: cache.accessToken.access_token,
      labMode: cache.labMode
    })
    .then(rsp => {
      console.log(`found ${rsp.length} results`)
      // if we found anything, put customer ID in cache
      if (rsp.length) {
        cache.customerId = rsp[0].id
      }
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('getCustomer()', function () {
  it('should get Context Service customer by customer ID', function (done) {
    lib.dataObject.get({
      type: 'customer',
      id: cache.customerId,
      token: cache.accessToken.access_token,
      labMode: cache.labMode
    })
    .then(rsp => {
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.machineAccount.refreshAccessToken()', function () {
  it('should refresh the machine account access token received in the previous test', function (done) {
    lib.machineAccount.refreshAccessToken({
      clientId: cache.clientId,
      clientSecret: cache.clientSecret,
      refreshToken: cache.accessToken.refresh_token
    })
    .then(rsp => {
      // console.log('refreshed access token:', rsp)
      cache.accessToken = rsp
      done()
    })
    .catch(e => {
      console.error(e)
      done(e)
    })
  })
})

describe('listAccessTokens', function () {
  it('should list the access tokens for org', function (done) {
    lib.org.listAccessTokens({
      orgId: cache.orgId,
      username: cache.orgUsername,
      bearer: cache.adminBearer,
      clientId: cache.clientId
    })
    .then(rsp => {
      // console.log(rsp)
      console.log(`found ${rsp.data.length} access tokens`)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

/****************/

describe('lib.machineAccount.remove()', function () {
  it('should delete the machine account that was created in the previous test', function (done) {
    lib.machineAccount.get({
      orgId: cache.orgId,
      bearer: cache.adminBearer,
      machineAccountId: cache.machineAccountId
    })
    .then(rsp => {
      console.log('removed machine account', rsp.id)
      done()
    })
    .catch(e => {
      // console.error(e)
      done(e)
    })
  })
})
