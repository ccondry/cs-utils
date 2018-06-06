// const sdk = require("../sdk/ContextService.js")
const chalk = require("chalk")
const request = require('request-promise-native')

// async function getCustomer ({customerId, token, clientId, clientSecret}) {
//   await sdk.init({
//     token,
//     discovery,
//     clientId,
//     clientSecret
//   }, {
//     LAB_MODE: !argv.prod,
//     DISABLE_TIMERS: true,
//     SERVICE_NAME: "jstestutils"
//   })
//   try {
//     const custData = await sdk.get(sdk.ENTITY_TYPES.CUSTOMER, customerId)
//   	console.log(chalk.gray("************************* CUSTOMER DATA *************************"))
//   	console.log(chalk.white("Field Sets:"), chalk.cyan(JSON.stringify(custData.fieldsets)))
//   	console.log(chalk.white("Data Elements:"), chalk.cyan(custData.dataElements ? JSON.stringify(custData.dataElements):{}))
//   	console.log(chalk.gray("************************************************************"))
//     return custData
//   } catch (e) {
//     console.error(chalk.red("Cannot get customer with id "), chalk.bold(customerId), (e.data? e.data.error: e) || '')
//     throw e
//   }
// }
// module.exports = {
//   getCustomer
// }

async function search (bearer, qs, labMode = true) {
  const url = `https://cs-rest.produs1.ciscoccservice.com/context/v1/customer`

  const headers = {
    // 'Accept': 'application/json; charset=UTF-8',
    'cisco-context-labmode': '' + labMode,
    'Authorization': 'Bearer ' + bearer
  }

  // const qs = {
  //   q
  // }

  const results = await request({
    url,
    method: 'get',
    headers,
    qs
  })
  return JSON.parse(results)
}

module.exports = {
  search
}
