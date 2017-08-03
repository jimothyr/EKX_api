var request = require('request');
var unfluff = require('unfluff');
// var search = require('../search/elasticsearch');

exports.getSearchPost = function(keywords){
	return new Promise(function (resolve, reject) {
        request.post({url:'http://ukerc.rl.ac.uk/cgi-bin/era001.pl', formData: {STerm:keywords}}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        return resolve(unfluff(body));
        });
	})
}