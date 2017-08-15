var request = require('request');
var search = require('../search/elasticsearch');

exports.get_organisations = function(keywords, providerId){
	return new Promise(function (resolve, reject) {
		request({
		    url: 'http://esc.connector.services/api/search.php?keywords='+encodeURIComponent(keywords),
		    method: "GET",
		    json: true,   // <--Very important!!
		}, function (error, response, body){
			if(error){
				return reject(error);
			}
			if(body.data){
				body.data = body.data.map(function(item){
					item.websites = item.websites.map(function(website){
						return search.encryptLink(website, providerId);
					});
					return item;
				})
				body.data.sort(function(a, b){
			    var keyA = a.pages,
			        keyB = b.pages;
			    // Compare the 2 dates
			    if(keyA > keyB) return -1;
			    if(keyA < keyB) return 1;
			    return 0;
			});
				return resolve(body.data.slice(0, 20))
			}else{
			   return resolve([]);
			}
		});
	}).catch((error) => {
        console.log('organisations - ', error)
		return reject(error);
    })
}