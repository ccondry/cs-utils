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
			return response.data;
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
			return response.data;
		});
	}
}
