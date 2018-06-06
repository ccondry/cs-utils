const lib = require('../lib')
const sdk = require('../sdk')
const config = require('./config')

const cache = {}

// describe('auth.getOrgAdminToken(username, password, orgId, scopes)', function () {
//   it('should get org admin token', function (done) {
//     this.timeout(4000)
//     lib.tokens.getOrgAdminToken(config.orgEmail, config.orgPassword, config.orgId)
//     .then(response => {
//       // console.log('getOrgAdminToken', response)
//       cache.adminBearer = response.access_token
//       done()
//     })
//     .catch(e => {
//       done(e)
//     })
//   })
// })

// describe('lib.machineAccount.create()', function () {
//   it('should create Machine Account', function (done) {
//     lib.machineAccount.create({
//       orgId: config.orgId,
//       bearer: cache.adminBearer
//     })
//     .then(rsp => {
//       console.log('created machine account', rsp.id)
//       cache.machineAccountId = rsp.id
//       done()
//     })
//     .catch(e => {
//       done(e)
//     })
//   })
// })

// describe('lib.machineAccount.setPassword()', function () {
//   it('should set Machine Account password', function (done) {
//     const password = lib.utils.generatePassword()
//     lib.machineAccount.setPassword({
//       orgId: config.orgId,
//       bearer: cache.adminBearer,
//       password,
//       machineAccountId: cache.machineAccountId
//     })
//     .then(rsp => {
//       console.log(`set machine account ${machineAccountId} password to ${password}:`)
//       done()
//     })
//     .catch(e => {
//       console.error(e)
//       done(e)
//     })
//   })
// })

// describe('lib.machineAccount.list()', function () {
//   it('should list Context Service machine accounts', function (done) {
//     // get machine account list
//     lib.machineAccount.list({
//       orgId: config.orgId,
//       bearer: cache.adminBearer
//     })
//     .then(rsp => {
//       // console.log('machine accounts list:', rsp)
//       // console.log(rsp.data[0].meta)
//       // console.log(rsp.data[0])
//       // cache first result
//       // cache.machineId = rsp.data[0].id
//       done()
//     })
//     .catch(e => {
//       done(e)
//     })
//   })
// })

// describe('lib.machineAccount.get()', function () {
//   it('should list Context Service machine accounts', function (done) {
//     // decode the connection data string into JSON
//     // const connectionData = lib.utils.decodeConnectionData(config.connectionDataString)
//     // get credentials
//     // const credentials = lib.utils.getCredentials(connectionData, config.labMode)
//     // get machine account
//     lib.machineAccount.get({
//       orgId: config.orgId,
//       bearer: cache.adminBearer,
//       machineId: cache.machineId
//     })
//     .then(rsp => {
//       console.log('machine account:', rsp)
//       done()
//     })
//     .catch(e => {
//       done(e)
//     })
//   })
// })

describe('lib.utils.decodeConnectionData()', function () {
  it('should decode connection data string into JSON', function (done) {
    const connectionData = lib.utils.decodeConnectionData(config.connectionDataString)
    // console.log('decoded connection data', connectionData)
    cache.connectionData = connectionData
    done()
  })
})

describe('lib.utils.getCredentials()', function () {
  it('should extract labMode credentials from decoded connectionData string', function (done) {
    const credentials = lib.utils.getCredentials(cache.connectionData, config.labMode)
    // console.log('lab mode credentials:', credentials)
    // check that we got the lab mode credentials
    if (credentials !== cache.connectionData.credentialsLabMode) {
      done('credentials extracted were not the correct ones. got', credentials)
    } else {
      // console.log('lab mode credentials', credentials)
      cache.credentials = credentials
      done()
    }
  })
})

describe('lib.tokens.getAccessToken()', function () {
  it('should get access token using connectionData', function (done) {
    this.timeout(8000)
    lib.tokens.getAccessToken(cache.credentials, cache.connectionData.identityBrokerUrl, true)
    .then(rsp => {
      // console.log('access token:', rsp)
      cache.accessToken = rsp
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})
//
// describe('lib.customer.get()', function () {
//   it('should get customer from CS', function (done) {
//     this.timeout(8000)
//     lib.customer.get({
//       orgId: cache.credentials.orgId,
//       bearer: cache.accessToken.access_token,
//       q: 'Context_First_Name:Coty'
//     })
//     .then(rsp => {
//       console.log(rsp)
//       done()
//     })
//     .catch(e => {
//       // console.error(e)
//       done(e)
//     })
//   })
// })


// describe('sdk.init()', function () {
//   it('should init the Context Service SDK', function (done) {
//     this.timeout(40000)
//     sdk.init({
//       token: cache.accessToken,
//       discovery: cache.connectionData.discoveryUrl,
//       clientId: cache.credentials.clientId,
//       clientSecret: cache.credentials.clientSecret
//     }, {
//       LAB_MODE: true,
//       DISABLE_TIMERS: true,
//       SERVICE_NAME: 'jstestutils'
//     })
//     .then(rsp => {
//       console.log('sdk init finished account:', rsp)
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
//     cache.accessToken = {
//       refresh_token: 'YTMyYWZhYjYtYmRhZC00YmFlLTgxMmEtMjMzMTI5OTZiNDQ4NjM2Y2EzNDQtYjky'
//     }
//     lib.tokens.refreshAccessToken(config.connectionDataString, true, cache.accessToken)
//     .then(rsp => {
//       console.log('refreshed access token:', rsp)
//       cache.accessToken = rsp
//       done()
//     })
//     .catch(e => {
//       console.error(e)
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
//       // config.customerId,
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
