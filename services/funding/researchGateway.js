var request = require('request');

exports.gatewayProjectSearch = function(keywords){
    return new Promise(function (resolve, reject) {
		request({
		    url: 'http://gtr.rcuk.ac.uk/search/project?term='+encodeURIComponent(keywords),
		    method: "GET",
		    json: true,   // <--Very important!!
		}, function (error, response, body){
			if(error){
				return reject(error);
			}
			if(body.searchResult){
                return resolve(body.searchResult.results);
            }
        })
    })
}