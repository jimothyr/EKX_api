var request = require('request');
var cheerio = require('cheerio');

exports.getSearchPost = function(keywords){
	return new Promise(function (resolve, reject) {
        request.post({url:'http://ukerc.rl.ac.uk/cgi-bin/era001.pl', formData: {STerm:keywords}}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        var $ = cheerio.load(body);
        var retArr = [];
        $('.resultslist').each(function(i, elem){
            $(this).find('a').each(function(i, elem){
                retArr.push({url: $(this).attr('href'), text: $(this).text()});
            })
        })
        return resolve({links: retArr, raw: body});
        });
	})
}