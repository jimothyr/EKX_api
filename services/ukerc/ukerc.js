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
        var relatedLinks = '<div class="panel-group" id="relatedAccordion" role="tablist" aria-multiselectable="true">';
        var panelHTML = R$('#panelTemplate').html();
        var relatedHTML,relatedContent;
        
        //----------------DOCS
        relatedHTML = R$('#resultTemplatePages').html();
        relatedContent = '';
        ukercObj.info.documents.forEach(function(e,i){
            relatedContent += relatedHTML.replace(/{{link}}/g, e._source.link)
                            .replace(/{{title}}/g, e._source.title)
                            .replace(/{{summary}}/g, e._source.summary)
                            .replace(/{{lang_score}}/g, (e._source.eng_lang_score[0] > 90 ? 'success' : (e._source.eng_lang_score[0] > 70 ? 'warning' : 'danger')))
                            .replace(/{{author}}/g, e._source.author)
                            .replace(/{{pubDate}}/g, e._source.pubDate.substring(0,e._source.pubDate.indexOf(':')-3))
                            if(i==9){return false;}
        })
        relatedLinks += panelHTML.replace(/{{id}}/g, 'docs').replace(/{{title}}/g, 'Documents').replace(/{{content}}/g, relatedContent).replace(/{{in}}/g, 'in');

        //----------------PEOPLE
        relatedHTML = R$('#resultTemplatePeople').html();
        relatedContent = '';
        ukercObj.info.documents.forEach(function(e,i){
            e._source.people.forEach(function(p,i){
            var tPer = (p.text?p.text:p);
                relatedContent += relatedHTML.replace(/{{name}}/g, tPer)
                        .replace(/{{title}}/g, e._source.title)
                        .replace(/{{link}}/g, e._source.link)
                        .replace(/{{provider}}/g, (e._source.provider?e._source.provider+' | ':'')); 
                        if(i==9){return false;}
            })
        })
        relatedLinks += panelHTML.replace(/{{id}}/g, 'people').replace(/{{title}}/g, 'People').replace(/{{content}}/g, relatedContent).replace(/{{in}}/g, '');
        
        //----------------ORGS
        relatedHTML = R$('#resultTemplateOrgs').html();
        relatedContent = '';
        ukercObj.info.organisations.forEach(function(e,i){
            relatedContent += relatedHTML.replace(/{{name}}/g, e.name)
                .replace(/{{pages}}/g, e.pages)
                .replace(/{{link}}/g, e.websites[0])
                if(i==9){return false;}
        })
        relatedLinks += panelHTML.replace(/{{id}}/g, 'orgs').replace(/{{title}}/g, 'Organisations').replace(/{{content}}/g, relatedContent).replace(/{{in}}/g, '');

        //----------------FUNDING
        relatedHTML = R$('#resultTemplateFunding').html();
        relatedContent = '';
        ukercObj.info.funding.forEach(function(e,i){
            relatedContent += relatedHTML.replace(/{{projectUrl}}/g, e.projectComposition.project.url)
                .replace(/{{projectTitle}}/g, e.projectComposition.project.title)
                .replace(/{{funderName}}/g, e.projectComposition.project.fund.funder.name)
                .replace(/{{grantCategory}}/g, e.projectComposition.project.grantCategory)
                .replace(/{{leadResearchOrganisationUr}}/g, e.projectComposition.leadResearchOrganisation.url)
                .replace(/{{leadResearchOrganisationName}}/g, e.projectComposition.leadResearchOrganisation.name)
                .replace(/{{fundValuePounds}}/g, Number(e.projectComposition.project.fund.valuePounds).toLocaleString())
                .replace(/{{fundStart}}/g, e.projectComposition.project.fund.start.replace(/-/g, '/'))
                .replace(/{{fundEnd}}/g, e.projectComposition.project.fund.end.replace(/-/g, '/'))
                if(i==9){return false;}
        })
        relatedLinks += panelHTML.replace(/{{id}}/g, 'funding').replace(/{{title}}/g, 'Funding').replace(/{{content}}/g, relatedContent).replace(/{{in}}/g, '');

        //----------------SOCIAL
        relatedHTML = R$('#resultTemplateSocial').html();
        relatedContent = '';
        ukercObj.info.social.items.forEach(function(e,i){
            relatedContent += relatedHTML.replace(/{{link}}/g, e.link)
                .replace(/{{title}}/g, e.title)
                if(i==9){return false;}
        })
        relatedLinks += panelHTML.replace(/{{id}}/g, 'social').replace(/{{title}}/g, 'Social').replace(/{{content}}/g, relatedContent).replace(/{{in}}/g, '');

        relatedLinks += '</div>';        
        retString += ukercObj.html.body.replace(/{{UKERCTable}}/g, ukercTable).replace(/{{UKERCRelated}}/g, relatedLinks).replace(/{{title}}/g, ukercObj.info.content.title);
        retString += ukercObj.html.foot;
        return resolve(retString);
    })
   }) 
}