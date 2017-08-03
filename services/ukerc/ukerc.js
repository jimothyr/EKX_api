var request = require('request');
var unfluff = require('unfluff');
// var search = require('../search/elasticsearch');

exports.getSearchPost = function(keywords){
	return new Promise(function (resolve, reject) {
        request.post({url:'http://ukerc.rl.ac.uk/cgi-bin/era001.pl', formData: {STerm:keywords}}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        var HTMLBody = unfluff(body);
        var links = HTMLBody.links || [];
        var retArr = [];
        links.forEach(function(l,i){
            if(l.href.includes('://') && l.text != 'Remove all Filters'){
                retArr.push(l);
            }
        })
        return resolve({links: retArr, orig: HTMLBody});
        });
	})
}