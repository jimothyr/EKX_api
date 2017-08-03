var request = require('request'),
    cheerio = require('cheerio'),
    services = require('../services/get_services'),
    fs       = require('fs');

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

var getHtmlTemplate = function(template){
   return new Promise(function (resolve, reject) {
        fs.readFile(process.env.OPENSHIFT_DATA_DIR+'UKERC_templates/'+template+'.html',"utf8",function read(err, data) {
            return resolve(data.replace(/\n/g, ''));
        });
   }) 
}

exports.getPage = function(link){
   return new Promise(function (resolve, reject) {
    var ukercObj = {
        html:{}
    }
    var proms = [    
        services.getHTMLContent(link)
        .then(function(retObj){
            ukercObj.info = retObj;
        }),
        getHtmlTemplate('head')
        .then(function(retHTML){
            ukercObj.html.head = retHTML;
        }),
        getHtmlTemplate('body')
        .then(function(retHTML){
            ukercObj.html.body = retHTML;
        }),
        getHtmlTemplate('related')
        .then(function(retHTML){
            ukercObj.html.related = retHTML;
        }),
        getHtmlTemplate('foot')
        .then(function(retHTML){
            ukercObj.html.foot = retHTML;
        })
    ]
    var items = Promise.all(proms);
    items.then(function(results){
        var retString = ukercObj.html.head.replace(/{{title}}/g, ukercObj.info.content.title);
        var U$ = cheerio.load(ukercObj.info.content.html.replace(/\n/g, ''));
        var R$ = cheerio.load(ukercObj.html.related);
        var ukercTable = U$('.resultsblock').html();
        U$(table).addClass('table');
        var relatedLinks = '';
        retString += ukercObj.html.body.replace(/{{UKERCTable}}/g, ukercTable).replace(/{{UKERCRelated}}/g, relatedLinks).replace(/{{title}}/g, ukercObj.info.content.title);
        retString += ukercObj.html.foot;
        return resolve(retString);
    })
   }) 
}