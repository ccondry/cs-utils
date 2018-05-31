module.exports = {
  decodeConnectionData,
  getCredentials,
  getAuthHeader
}

function getCredentials (connectionData, labMode) {
	return labMode ? connectionData.credentials : connectionData.credentialsLabMode
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
