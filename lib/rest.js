'use strict';

var Promise = require('es6-promise').Promise,
	axios = require('axios');

var TIMEOUT = 10000; //10 secs

module.exports = {
	 getApi : function(url,token) {
		var headers = {
			'Authorization' : 'Bearer ' + token
		};
		return axios({ url: url, method: 'get', headers: headers, timeout: TIMEOUT })
		.then(function (response) {
				 return response.data;
		}).catch(function (err) {
			console.log('### GET API Error ### ',err.data,' status: ', err.status);
			throw err;
		});
	},

	putApi : function(url, data, token) {
		var headers = {
			'Authorization' : 'Bearer ' + token,
			'Content-Type' : 'application/json'
		};
		return axios ({ url: url, method: 'put', headers: headers, data: data, timeout: TIMEOUT })
		.then (function (response) {
				return response;
		}).catch(function (err) {
			console.log ('PUT API Error: ', err.data,' status: ',  err.status);
			throw err;
		});
	},

	postApi : function(url, data, token) {
		var headers = {
			'Authorization' : 'Bearer ' + token,
			'Content-Type' : 'application/json'
		};
		return axios ({
					url: url,
					method: 'post',
					headers: headers,
					data: data,
					timeout: TIMEOUT
		})
		.then (function (response) {
			console.log("Post API response: ", JSON.stringify(response.data));
			return response.data;
		}).catch (function (error) {
			console.log ("Post API Error: ", err.data, ' status: ', err.status);
			throw err;
		});

	},

	deleteApi : function(url, token) {
		var headers = {
			'Authorization' : 'Bearer ' + token
		};
		return  axios({ url:url,
				method:'delete',
				headers: headers,
				timeout: TIMEOUT
			})
		.then(function (response) {
			console.log("## DELETE API response ",JSON.stringify(response.data));
			return response.data;
		}).catch(function(err){
			console.log("## DELETE API Error ",err.data, ' status: ', err.status);
			throw err;
		});
	}
}
