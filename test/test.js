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

describe('lib.platform.getStatus()', function () {
  it('should get platform status', function (done) {
    lib.platform.getStatus()
    .then(response => {
      console.log(response.message)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

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
      console.log('clientId = ', cache.clientId)
      cache.clientSecret = credentials.clientSecret
      cache.orgId = credentials.orgId
      console.log('orgId = ', cache.orgId)
      done()
    }
  })
})

describe('lib.org.getAdminAccessToken()', function () {
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
      cache.adminBearer = response.access_token
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.org.get()', function () {
  it('should get org details', function (done) {
    lib.org.get({
      orgId: cache.orgId,
      bearer: cache.adminBearer
    })
    .then(response => {
      // console.log(JSON.parse(response.orgSettings))
      console.log('org display name is', response.displayName)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.org.getProperty() - org.apptypes', function () {
  it('should get org.apptypes property', function (done) {
    lib.org.getProperty({
      property: 'org.apptypes',
      bearer: cache.adminBearer
    })
    .then(response => {
      console.log('org.appTypes:', response.value)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.org.listApps()', function () {
  it('should list platform apps', function (done) {
    lib.org.listApps({
      bearer: cache.adminBearer
    })
    .then(response => {
      console.log(`found ${response.length} apps`)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.org.listAccessTokens()', function () {
  it('should list the access tokens for org', function (done) {
    lib.org.listAccessTokens({
      orgId: cache.orgId,
      username: cache.orgUsername,
      bearer: cache.adminBearer,
      clientId: cache.clientId
    })
    .then(rsp => {
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
        // console.log(e.message)
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
        // console.log(e.message)
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
      // console.log('new machine account id', rsp.id)
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
      // console.log(`set machine account ${cache.machineAccountId} password to ${password}:`)
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
    this.timeout(20000)
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
    // long timeout
    this.timeout(14000)
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

/********************
Creating Data Objects
********************/

describe('lib.dataObject.create() - customer', function () {
  it('should create Context Service customer', function (done) {
    lib.dataObject.create({
      type: 'customer',
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode,
      body: {
        "fieldsets": [
          "cisco.base.customer"
        ],
        "dataElements": [
          // name is encrypted PII
          { "Context_First_Name": "Mocha" },
          { "Context_Last_Name": "Test" },
          // preferred language is unencrypted, non-PII
          { "Context_Preferred_Language": "it-IT" }
        ]
      }
    })
    .then(rsp => {
      // put customer ID in cache
      cache.customerId = rsp.id
      // put customer ref URL in cache
      cache.customerRefUrl = rsp.refUrl
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.create() - request', function () {
  it('should create Context Service request object associated with the customer we created', function (done) {
    lib.dataObject.create({
      type: 'request',
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode,
      body: {
        "customerRefUrl": cache.customerRefUrl,
        "state": "active", // or "closed"
        "fieldsets": [
          "cisco.base.request"
        ],
        "dataElements": [
          {
            "Context_Title": "Mocha test request",
            "type": "string"
          }
        ]
      }
    })
    .then(rsp => {
      // put request ID in cache
      cache.requestId = rsp.id
      // put request ref URL in cache
      cache.requestRefUrl = rsp.refUrl
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.create() - activity', function () {
  it('should create Context Service activity associated with customer and request', function (done) {
    lib.dataObject.create({
      type: 'activity',
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode,
      body: {
        "state": "active", // or "closed"
        "parentRefUrl": cache.requestRefUrl,
        "customerRefUrl": cache.customerRefUrl,
        "fieldsets": [
          "cisco.base.pod"
        ],
        "dataElements": [
          {
            "Context_Notes": "Mocha test activity",
            "type": "string"
          }
        ]
      }
    })
    .then(rsp => {
      // put activity ID in cache
      cache.activityId = rsp.id
      // put activity ref URL in cache
      cache.activityRefUrl = rsp.refUrl
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.create() - workitem', function () {
  it('should create Context Service workitem associated with customer and request', function (done) {
    lib.dataObject.create({
      type: 'workitem',
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode,
      body: {
        "state": "active", // or "closed"
        "parentRefUrl": cache.requestRefUrl,
        "customerRefUrl": cache.customerRefUrl,
        "fieldsets": [
          "cisco.base.workitem"
        ],
        "dataElements": [
          {
            "Context_Title": "Mocha test workitem",
            "type": "string"
          }
        ]
      }
    })
    .then(rsp => {
      // put work item ID in cache
      cache.workitemId = rsp.id
      // put work item ref URL in cache
      cache.workitemRefUrl = rsp.refUrl
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.create() - detail', function () {
  it('should create Context Service detail associated with workitem', function (done) {
    lib.dataObject.create({
      type: 'detail',
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode,
      body: {
        "parentRefUrl": cache.workitemRefUrl,
        "fieldsets": [
          "cisco.base.comment"
        ],
        "dataElements": [
          // {
          //   "Context_Comment": "Mocha test detail",
          //   "type": "string"
          // },
          {
            "Context_DisplayName": "Mocha test detail",
            "type": "string"
          }
        ]
      }
    })
    .then(rsp => {
      // put work item ID in cache
      cache.detailId = rsp.id
      // put work item ref URL in cache
      cache.detailRefUrl = rsp.refUrl
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

/**************************
Getting Single Data Objects
**************************/

describe('lib.dataObject.get() - customer', function () {
  it('should get Context Service customer by ID', function (done) {
    lib.dataObject.get({
      type: 'customer',
      id: cache.customerId,
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode
    })
    .then(rsp => {
      cache.customer = rsp
      console.log(rsp)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.get() - request', function () {
  it('should get Context Service request by ID', function (done) {
    lib.dataObject.get({
      type: 'request',
      id: cache.requestId,
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode
    })
    .then(rsp => {
      cache.request = rsp
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.get() - activity', function () {
  it('should get Context Service activity by ID', function (done) {
    lib.dataObject.get({
      type: 'activity',
      id: cache.activityId,
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode
    })
    .then(rsp => {
      cache.activity = rsp
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.get() - workitem', function () {
  it('should get Context Service workitem by ID', function (done) {
    lib.dataObject.get({
      type: 'workitem',
      id: cache.workitemId,
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode
    })
    .then(rsp => {
      cache.workitem = rsp
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.get() - detail', function () {
  it('should get Context Service detail by ID', function (done) {
    lib.dataObject.get({
      type: 'detail',
      id: cache.detailId,
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode
    })
    .then(rsp => {
      cache.detail = rsp
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

/*************************
Searching for Data Objects
*************************/

describe('lib.dataObject.search() - customer', function () {
  it('should search for Context Service customers', function (done) {
    lib.dataObject.search({
      type: 'customer',
      query: 'Context_Last_Name:Test',
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode
    })
    .then(rsp => {
      console.log(`found ${rsp.length} customers`)
      console.log('first customer', rsp[0])
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.search() - request', function () {
  it('should search for Context Service requests', function (done) {
    lib.dataObject.search({
      type: 'request',
      query: 'Context_Title:Mocha test request',
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode
    })
    .then(rsp => {
      console.log(`found ${rsp.length} requests`)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.search() - activity', function () {
  it('should search for Context Service activities', function (done) {
    lib.dataObject.search({
      type: 'activity',
      query: 'Context_Notes:Mocha test activity',
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode
    })
    .then(rsp => {
      console.log(`found ${rsp.length} activities`)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.search() - workitem', function () {
  it('should search for Context Service workitems', function (done) {
    lib.dataObject.search({
      type: 'workitem',
      query: 'Context_Title:Mocha test workitem',
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode
    })
    .then(rsp => {
      console.log(`found ${rsp.length} workitems`)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.search() - detail', function () {
  it('should search for Context Service details', function (done) {
    lib.dataObject.search({
      type: 'detail',
      query: 'Context_DisplayName:Mocha test detail',
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode
    })
    .then(rsp => {
      console.log(`found ${rsp.length} details`)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

/********************
Updating Data Objects
********************/

describe('lib.dataObject.update() - customer', function () {
  it('should update Context Service customer', function (done) {
    lib.dataObject.update({
      type: 'customer',
      id: cache.customerId,
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode,
      body: cache.customer
    })
    .then(rsp => {
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.update() - request', function () {
  it('should update Context Service request', function (done) {
    lib.dataObject.update({
      type: 'request',
      id: cache.requestId,
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode,
      body: cache.request
    })
    .then(rsp => {
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.update() - activity', function () {
  it('should update Context Service activity', function (done) {
    lib.dataObject.update({
      type: 'activity',
      id: cache.activityId,
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode,
      body: cache.activity
    })
    .then(rsp => {
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.dataObject.update() - workitem', function () {
  it('should update Context Service workitem', function (done) {
    lib.dataObject.update({
      type: 'workitem',
      id: cache.workitemId,
      bearer: cache.accessToken.access_token,
      labMode: cache.labMode,
      body: cache.workitem
    })
    .then(rsp => {
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

// context service detail object cannot be updated because it is always in 'closed' state
//
// describe('lib.dataObject.update() - detail', function () {
//   it('should update Context Service detail', function (done) {
//     lib.dataObject.update({
//       type: 'detail',
//       id: cache.detailId,
//       bearer: cache.accessToken.access_token,
//       labMode: cache.labMode,
//       body: cache.detail
//     })
//     .then(rsp => {
//       done()
//     })
//     .catch(e => {
//       done(e)
//     })
//   })
// })

/**************************
Creating Admin Data Objects
**************************/

describe('lib.adminDataObject.create() - field', function () {
  it('should create Context Service field', function (done) {
    // set up test parameters
    cache.fieldId = 'Mocha_Test_Field'
    lib.adminDataObject.create({
      type: 'field',
      bearer: cache.adminBearer,
      body: {
        "id": cache.fieldId,
        "description": "Mocha Test Field",
        "classification": "UNENCRYPTED",
        "classificationUI": "Unencrypted",
        "dataType": "string",
        "dataTypeUI": "",
        "dataTypeValue": {
          "label": "Short Text",
          "value": "string"
        },
        "translations": {
          "en_US": "Mocha Test"
        },
        "searchable": true,
        "publiclyAccessible": false,
        "publiclyAccessibleUI": ""
      }
    })
    .then(rsp => {
      cache.field = rsp
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.adminDataObject.create() - fieldset', function () {
  it('should create Context Service fieldset', function (done) {
    // set up test parameters
    cache.fieldsetId = 'Mocha_Test_Fieldset'
    lib.adminDataObject.create({
      type: 'fieldset',
      bearer: cache.adminBearer,
      body: {
        "id": cache.fieldsetId,
        "description": "Mocha Test Fieldset",
        "fields": [cache.fieldId],
        "inactiveFields": [],
        "publiclyAccessible": false,
        "publiclyAccessibleUI": ""
      }
    })
    .then(rsp => {
      cache.field = rsp
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

/*******************************
Searching for Admin Data Objects
*******************************/

describe('lib.adminDataObject.search() - fields', function () {
  it('should search for Context Service fields', function (done) {
    lib.adminDataObject.search({
      type: 'field',
      query: 'id:*',
      maxEntries: '1500',
      bearer: cache.adminBearer,
    })
    .then(rsp => {
      console.log(`found ${rsp.length} fields`)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.adminDataObject.search() - fieldsets', function () {
  it('should search for Context Service fieldsets', function (done) {
    lib.adminDataObject.search({
      type: 'fieldset',
      query: 'id:*',
      maxEntries: '1500',
      bearer: cache.adminBearer,
    })
    .then(rsp => {
      console.log(`found ${rsp.length} fieldsets`)
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

/****************************
Get Single Admin Data Objects
****************************/

describe('lib.adminDataObject.get() - field', function () {
  it('should get Context Service field by ID', function (done) {
    lib.adminDataObject.get({
      type: 'field',
      id: cache.fieldId,
      bearer: cache.adminBearer,
    })
    .then(rsp => {
      cache.field = rsp
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.adminDataObject.get() - fieldset', function () {
  it('should get Context Service fieldset by ID', function (done) {
    lib.adminDataObject.get({
      type: 'fieldset',
      id: cache.fieldsetId,
      bearer: cache.adminBearer,
    })
    .then(rsp => {
      cache.fieldset = rsp
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

/************************
Update Admin Data Objects
************************/

describe('lib.adminDataObject.update() - field', function () {
  it('should update Context Service field', function (done) {
    lib.adminDataObject.update({
      type: 'field',
      id: cache.fieldId,
      body: cache.field,
      bearer: cache.adminBearer,
    })
    .then(rsp => {
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.adminDataObject.update() - fieldset', function () {
  it('should update Context Service fieldset', function (done) {
    lib.adminDataObject.get({
      type: 'fieldset',
      id: cache.fieldsetId,
      body: cache.fieldset,
      bearer: cache.adminBearer,
    })
    .then(rsp => {
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

/**********************************
Remove data objects that we created
**********************************/

describe('lib.dataObject.remove() - customer', function () {
  it('should remove Context Service customer by ID', function (done) {
    if (cache.labMode !== true) {
      done('You can only use remove operation when labMode = true')
    }
    lib.dataObject.remove({
      type: 'customer',
      id: cache.customerId,
      bearer: cache.accessToken.access_token,
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

describe('lib.dataObject.remove() - request', function () {
  it('should remove Context Service request by ID', function (done) {
    if (cache.labMode !== true) {
      done('You can only use remove operation when labMode = true')
    }
    lib.dataObject.remove({
      type: 'request',
      id: cache.requestId,
      bearer: cache.accessToken.access_token,
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


describe('lib.dataObject.remove() - activity', function () {
  it('should remove Context Service activity by ID', function (done) {
    if (cache.labMode !== true) {
      done('You can only use remove operation when labMode = true')
    }
    lib.dataObject.remove({
      type: 'activity',
      id: cache.activityId,
      bearer: cache.accessToken.access_token,
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

describe('lib.dataObject.remove() - workitem', function () {
  it('should remove Context Service workitem by ID', function (done) {
    if (cache.labMode !== true) {
      done('You can only use remove operation when labMode = true')
    }
    lib.dataObject.remove({
      type: 'workitem',
      id: cache.workitemId,
      bearer: cache.accessToken.access_token,
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

describe('lib.dataObject.remove() - detail', function () {
  it('should remove Context Service detail by ID', function (done) {
    if (cache.labMode !== true) {
      done('You can only use remove operation when labMode = true')
    }
    lib.dataObject.remove({
      type: 'detail',
      id: cache.detailId,
      bearer: cache.accessToken.access_token,
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


/**************************
Removing Admin Data Objects
**************************/

describe('lib.adminDataObject.remove() - fieldset', function () {
  it('should remove Context Service fieldset that we created earlier', function (done) {
    lib.adminDataObject.remove({
      type: 'fieldset',
      bearer: cache.adminBearer,
      id: cache.fieldsetId
    })
    .then(rsp => {
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

describe('lib.adminDataObject.remove() - field', function () {
  it('should remove Context Service field that we created earlier', function (done) {
    lib.adminDataObject.remove({
      type: 'field',
      bearer: cache.adminBearer,
      id: cache.fieldId
    })
    .then(rsp => {
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})

/********************************
Remove machine account we created
********************************/

describe('lib.machineAccount.remove()', function () {
  it('should delete the machine account that was created in the previous test', function (done) {
    lib.machineAccount.get({
      orgId: cache.orgId,
      bearer: cache.adminBearer,
      machineAccountId: cache.machineAccountId
    })
    .then(rsp => {
      done()
    })
    .catch(e => {
      done(e)
    })
  })
})
