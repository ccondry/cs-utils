// your org username that you use to log in to admin.webex.com
const orgUsername = 'username@domain.com'
// your org password that you use to log in to admin.webex.com
const orgPassword = 'password'
// get connection data string from https://ccfs.ciscoccservice.com/v1/authorize?callbackUrl=http%3A%2F%2Ffake&appType=ciscodemo
const connectionDataString = 'your Connection Data String From CCFS'
// lab mode allows deletion, production mode does not
const labMode = true
// is workitem enabled for this org?
const workitemEnabled = false

module.exports = {
  orgUsername,
  orgPassword,
  workitemEnabled,
  connectionDataString,
  labMode
}
