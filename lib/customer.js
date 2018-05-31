const sdk = require("../sdk/ContextService.js")
const chalk = require("chalk")

const discovery = 'https://discovery.produs1.ciscoccservice.com/'

async function getCustomer ({customerId, token, clientId, clientSecret}) {
  await sdk.init({
    token,
    discovery,
    clientId,
    clientSecret
  }, {
    LAB_MODE: !argv.prod,
    DISABLE_TIMERS: true,
    SERVICE_NAME: "jstestutils"
  })
  try {
    const custData = await sdk.get(sdk.ENTITY_TYPES.CUSTOMER, customerId)
  	console.log(chalk.gray("************************* CUSTOMER DATA *************************"))
  	console.log(chalk.white("Field Sets:"), chalk.cyan(JSON.stringify(custData.fieldsets)))
  	console.log(chalk.white("Data Elements:"), chalk.cyan(custData.dataElements ? JSON.stringify(custData.dataElements):{}))
  	console.log(chalk.gray("************************************************************"))
    return custData
  } catch (e) {
    console.error(chalk.red("Cannot get customer with id "), chalk.bold(customerId), (e.data? e.data.error: e) || '')
    throw e
  }
}
module.exports = {
  getCustomer
}
