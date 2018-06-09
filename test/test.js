const lib = require('../lib')
const config = require('./config')

// get initial config for tests
const cache = {
  orgId: config.orgId,
  labMode: config.labMode,
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  // adminBearer: config.adminBearer,
  adminClientId: config.adminClientId,
  adminClientSecret: config.adminClientSecret
}

describe('lib.org.getAdminAccessToken({username, password, orgId, scopes})', function () {
  it('should get org admin token', function (done) {
    this.timeout(4000)
    lib.org.getAdminAccessToken({
      username: cache.orgEmail,
      password: cache.orgPassword,
      clientId: cache.adminClientId,
      clientSecret: cache.adminClientSecret,
      orgId: cache.orgId
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

// describe('lib.org.getAdminAccessToken({username, password, orgId, scopes})', function () {
//   it('should get org admin token', function (done) {
//     this.timeout(4000)
//     lib.org.getAdminAccessToken({
//       username: cache.orgEmail,
//       password: cache.orgPassword,
//       clientId: cache.clientId,
//       clientSecret: cache.clientSecret,
//       orgId: cache.orgId
//     })
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

// describe('lib.org.onboard()', function () {
//   it('should onboard org with Context Service', function (done) {
//     this.timeout(8000)
//     lib.org.onboard({
//       orgId: cache.orgId,
//       bearer: cache.adminBearer
//     })
//     .then(rsp => {
//       // console.log('access token:', rsp)
//       // cache.accessToken = rsp
//       // console.log('onboard', rsp)
//       done()
//     })
//     .catch(e => {
//       if (e.statusCode === 400) {
//         // this is OK - means it is done already
//         console.log(e.message)
//         return done()
//       }
//       done(e)
//     })
//   })
// })
//
// describe('lib.org.migrate()', function () {
//   it('should migrate org with Context Service', function (done) {
//     this.timeout(8000)
//     lib.org.migrate({
//       orgId: cache.orgId,
//       bearer: cache.adminBearer
//     })
//     .then(rsp => {
//       // console.log('access token:', rsp)
//       // cache.accessToken = rsp
//       // console.log('onboard', rsp)
//       done()
//     })
//     .catch(e => {
//       if (e.statusCode === 400) {
//         // this is OK - means it is done already
//           console.log(e.message)
//         return done()
//       }
//       done(e)
//     })
//   })
// })

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

describe('lib.machineAccount.list()', function () {
  it('should list Context Service machine accounts', function (done) {
    // get machine account list
    lib.machineAccount.list({
      orgId: cache.orgId,
      bearer: cache.adminBearer
    })
    .then(rsp => {
      // console.log('machine accounts list:', rsp)
      // console.log(rsp.data[0].meta)
      // console.log(rsp.data[0])
      // cache first result
      // cache.machineId = rsp.data[0].id
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.machineAccount.get()', function () {
  it('should get Context Service machine account', function (done) {
    // decode the connection data string into JSON
    // const connectionData = lib.utils.decodeConnectionData(config.connectionDataString)
    // get credentials
    // const credentials = lib.utils.getCredentials(connectionData, config.labMode)
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
      query: 'Context_Last_Name:Littlefoot',
      token: cache.accessToken.access_token,
      labMode: cache.labMode
    })
    .then(rsp => {
      console.log(`found ${rsp.length} results`)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.machineAccount.refreshAccessToken()', function () {
  it('should refresh the machine account access token received in the previous test', function (done) {
    // auth.refreshToken(cache.credentials, cache.token)
    // cache.accessToken = {
    //   refresh_token: 'YTMyYWZhYjYtYmRhZC00YmFlLTgxMmEtMjMzMTI5OTZiNDQ4NjM2Y2EzNDQtYjky'
    // }
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

/*********************/





/*********************/

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





// describe('lib.utils.decodeConnectionData()', function () {
//   it('should decode connection data string into JSON', function (done) {
//     const connectionData = lib.utils.decodeConnectionData(config.connectionDataString)
//     // console.log('decoded connection data', connectionData)
//     cache.connectionData = connectionData
//     done()
//   })
// })
//
// describe('lib.utils.getCredentials()', function () {
//   it('should extract labMode credentials from decoded connectionData string', function (done) {
//     const credentials = lib.utils.getCredentials(cache.connectionData, config.labMode)
//     // console.log('lab mode credentials:', credentials)
//     // check that we got the lab mode credentials
//     if (credentials !== cache.connectionData.credentialsLabMode) {
//       done('credentials extracted were not the correct ones. got', credentials)
//     } else {
//       // console.log('lab mode credentials', credentials)
//       cache.credentials = credentials
//       done()
//     }
//   })
// })
//

//
// describe('lib.machineAccount.create({orgId, bearer, name, password})', function () {
//   it('should create Machine Account', function (done) {
//     lib.machineAccount.create({
//       orgId: cache.orgId,
//       bearer: cache.adminBearer,
//       name:
//       password:
//     })
//     .then(rsp => {
//       // console.log('created machine account', rsp.id)
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
