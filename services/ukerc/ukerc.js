var request = require('request');
var cheerio = require('cheerio');
// var unfluff = require('unfluff');
// var search = require('../search/elasticsearch');

exports.getSearchPost = function(keywords){
	return new Promise(function (resolve, reject) {
        request.post({url:'http://ukerc.rl.ac.uk/cgi-bin/era001.pl', formData: {STerm:keywords}}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        $ = cheerio.load(body);
        var retArr = [];
        $('.resultslist').each(function(i, elem){
            $(this).find('a').each(function(i, elem){
                retArr.push($(this))
            })
        })
        // var HTMLBody = unfluff(body);
        // var links = HTMLBody.links || [];
        links.forEach(function(l,i){
            if(l.href.includes('://') && l.text != 'Remove all Filters'){
                retArr.push(l);
            }
        })
        return resolve({links: retArr, raw: body});
        });
	})
}