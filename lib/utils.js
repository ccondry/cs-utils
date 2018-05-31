module.exports = {
  decodeConnectionData,
  getCredentials,
  getAuthHeader,
  generatePassword
}

function getCredentials (connectionData, labMode) {
  return labMode ? connectionData.credentialsLabMode : connectionData.credentials
}

function getAuthHeader (credentials) {
  return new Buffer(credentials.clientId + ":" + credentials.clientSecret).toString("base64")
}

// decode connection data from base64 string into JSON
function decodeConnectionData (connectionDataString) {
  const buff = new Buffer(connectionDataString, 'base64')
  const text = buff.toString('ascii')
  const connectionData = JSON.parse(text)
  return connectionData
}

function generatePassword () {
  return 'eeFF12$' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
