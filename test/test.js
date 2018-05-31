const lib = require('../lib')
const config = require('./config')

const cache = {}

describe('auth.getOrgAdminToken(username, password, orgId, scopes)', function () {
  it('should get org admin token', function (done) {
    this.timeout(4000)
    lib.tokens.getOrgAdminToken(config.orgEmail, config.orgPassword, config.orgId)
    .then(response => {
      console.log('getOrgAdminToken', response)
      cache.adminBearer = response.access_token
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.machineAccount.list()', function () {
  it('should list Context Service machine accounts', function (done) {
    // decode the connection data string into JSON
    const connectionData = lib.utils.decodeConnectionData(config.connectionDataString)
    // get credentials
    const credentials = lib.utils.getCredentials(connectionData, config.labMode)
    // get customer
    lib.machineAccount.list({
      orgId: config.orgId,
      bearer: cache.adminBearer
    })
    .then(rsp => {
      // console.log('machine accounts list:', rsp)
      // console.log(rsp.data[0].meta)
      cache.machineId = rsp.data[0].id
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.machineAccount.get()', function () {
  it('should list Context Service machine accounts', function (done) {
    // decode the connection data string into JSON
    const connectionData = lib.utils.decodeConnectionData(config.connectionDataString)
    // get credentials
    const credentials = lib.utils.getCredentials(connectionData, config.labMode)
    // get customer
    lib.machineAccount.get({
      orgId: config.orgId,
      bearer: cache.adminBearer,
      machineId: cache.machineId
    })
    .then(rsp => {
      console.log('machine account:', rsp)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

// describe('auth.decodeConnectionData(config.connectionDataString)', function () {
//   it('should decode connection data string into JSON', function (done) {
//     const connectionData = auth.decodeConnectionData(config.connectionDataString)
//     console.log('decoded connection data', connectionData)
//     cache.connectionData = connectionData
//     done()
//   })
// })

// describe('auth.getAccessToken(connectionData, config.labMode, includeconfig.kmsScopes)', function () {
//   it('should get access token', function (done) {
//     auth.getAccessToken(config.connectionDataString, true, true)
//     .then(rsp => {
//       console.log('access token:', rsp)
//       cache.accessToken = rsp
//       done()
//     })
//     .catch(e => {
//       done(e)
//     })
//   })
// })

// describe('refresh access token', function () {
//   it('should refresh the access token received in the previous test', function (done) {
//     // auth.refreshToken(cache.credentials, cache.token)
//     auth.refreshAccessToken(config.connectionDataString, true, cache.accessToken)
//     .then(rsp => {
//       console.log('refreshed access token:', rsp)
//       done()
//     })
//     .catch(e => {
//       done(e)
//     })
//   })
// })

// describe('getCustomer()', function () {
//   it('should get Context Service customer by customer ID', function (done) {
//     // decode the connection data string into JSON
//     const connectionData = auth.decodeConnectionData(config.connectionDataString)
//     // get credentials
//     const credentials = auth.getCredentials(connectionData, config.labMode)
//     // get customer
//     customer.get({
//       config.customerId,
//       token: cache.accessToken,
//       clientId: cache.credentials.clientId,
//       clientSecret: cache.credentials.clientSecret
//     })
//     .then(rsp => {
//       console.log('refreshed access token:', rsp)
//       done()
//     })
//     .catch(e => {
//       done(e)
//     })
//   })
// })

// describe('get machine account', function () {
//   it('should get machine account info, and hopefully refresh the lifetime on machine credentials', function (done) {
//     // auth.refreshToken(cache.credentials, cache.token)
//     auth.getMachineAccount(config.connectionDataString, true, cache.accessToken)
//     .then(rsp => {
//       console.log('refreshed access token:', rsp)
//       done()
//     })
//     .catch(e => {
//       done(e)
//     })
//   })
// })

// describe('listAccessTokens', function () {
//   it('should list the access tokens for user', function (done) {
//     // auth.listAccessTokens(config.connectionDataString, true)
//     auth.listAccessTokens(cache.accessToken)
//     .then(rsp => {
//       console.log('list of access tokens:', rsp)
//       done()
//     })
//     .catch(e => {
//       done(e)
//     })
//   })
// })

// describe('getCustomer', function () {
//   it('should list the access tokens for user', function (done) {
//
//
//     var customer = sdk.constructCustomer();
//     customer.fieldsets = fieldsets;
//     customer.dataElements = dataElements;
//     sdk.init({token: argv.token, discovery:discovery, clientId: client.id, clientSecret: client.secret},{ LAB_MODE: !argv.prod, DISABLE_TIMERS: true, SERVICE_NAME:"jstestutils"  })
//     .then(function(){
//     	return sdk.create(customer);
//     })
//     .then(function(custData){
//     	console.log(chalk.green("Successfully created Customer with ID :" + custData.id));
//     })
//     .catch(function(e){
//     	console.error(chalk.red("Cannot create customer"),(e.data? e.data.error: e)||'');
//     });
//
//
//     // auth.listAccessTokens(config.connectionDataString, true)
//     auth.listAccessTokens(cache.accessToken)
//     .then(rsp => {
//       console.log('list of access tokens:', rsp)
//       done()
//     })
//     .catch(e => {
//       done(e)
//     })
//   })
// })
