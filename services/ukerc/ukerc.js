var request = require('request');
// var search = require('../search/elasticsearch');

exports.getSearchPost = function(keywords){
	return new Promise(function (resolve, reject) {
		// request({
		//     url: 'http://ukerc.rl.ac.uk/cgi-bin/era001.pl',
		// 	method: "POST",
		// 	body: 'STerm='+keywords,
		//     // json: true,   // <--Very important!!
		// }, function (error, response, body){
		// 	if(error){
		// 		return reject(error);
		// 	}
		// 	return resolve(body);
        // });
        request.post({url:'http://ukerc.rl.ac.uk/cgi-bin/era001.pl', formData: {STerm:keywords}}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        return resolve(body);
        });
	})
}