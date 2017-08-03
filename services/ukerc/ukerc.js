var request = require('request'),
    cheerio = require('cheerio'),
    services = require('../services/get_services');

exports.getSearchPost = function(keywords){
	return new Promise(function (resolve, reject) {
        request.post({url:'http://ukerc.rl.ac.uk/cgi-bin/era001.pl', formData: {STerm:keywords}}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        var $ = cheerio.load(body);
        var dataArr = [], projectsArr = [], landscapesArr = [], pubArr = [], roadmapArr = [];
        var tUrl, tText;
        $('.resultslist').each(function(i, elem){
            $(this).find('a').each(function(i, elem){
                tUrl = $(this).attr('href');
                tText = $(this).text();
                if(tUrl.includes('&EWCompID=')){
                    dataArr.push({url: tUrl, text: tText})
                }else if(tUrl.includes('&GWGRN=')){
                    projectsArr.push({url: tUrl, text: tText})                    
                }else if(tUrl.includes('/Landscapes/')){
                    landscapesArr.push({url: tUrl, text: tText})                    
                }else if(tUrl.includes('/Roadmaps/')){
                    roadmapArr.push({url: tUrl, text: tText})                    
                }
            })
        })
        return resolve({links: {Data : dataArr, Projects : projectsArr, Landscapes : landscapesArr, Roadmaps : roadmapArr}, raw: body});
        });
	})
}

exports.getPage = function(link){
   return new Promise(function (resolve, reject) {
        services.getHTMLContent(link)
        .then(function(retObj){
            return resolve(retObj);
        })
   }) 
}