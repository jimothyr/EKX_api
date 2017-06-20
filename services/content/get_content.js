var unfluff = require('unfluff');
var request = require('request');
var textract = require('textract');
var appGlobals = require('../globals/globals.json');

var get_base64 = function(tUrl){
	return new Promise(function (resolve, reject) {
		request(tUrl, function(error, response, body){
			if(!error){
				return resolve(new Buffer(body, 'binary').toString('base64'));
	        }else{
	        	return reject(error);
	        }
		});		
	})
}

var getBase = function(base, relative) {
    //make sure base ends with /
    if (base[base.length - 1] != '/')
        base += '/';

    //base: https://server/relative/subfolder/
    //url: https://server
    let url = base.substr(0, base.indexOf('/', base.indexOf('//') + 2));
    //baseServerRelative: /relative/subfolder/
    let baseServerRelative = base.substr(base.indexOf('/', base.indexOf('//') + 2));
    if (relative.indexOf('/') === 0)//relative is server relative
        url += relative;
    else if (relative.indexOf("://") > 0)//relative is a full url, ignore base.
        url = relative;
    else {
        while (relative.indexOf('../') === 0) {
            //remove ../ from relative
            relative = relative.substring(3);
            //remove one part from baseServerRelative. /relative/subfolder/ -> /relative/
            if (baseServerRelative !== '/') {
                let lastPartIndex = baseServerRelative.lastIndexOf('/', baseServerRelative.length - 2);
                baseServerRelative = baseServerRelative.substring(0, lastPartIndex + 1);
            }
        }
        url += baseServerRelative + relative;//relative is a relative to base.
    }

    return url;
}

var get_file = function(tUrl, baseUrl){
	tUrl = (baseUrl ? getBase(baseUrl, tUrl) : tUrl);
	return new Promise(function (resolve, reject) {
		//how big is the file?
		// remote(tUrl, function(err, o) {
			textract.fromUrl(tUrl, function( error, text ) {
				if(!error){
					return resolve(text);
				}else{
					// --------------------------------------------------------┤ HAVE A GO WITH HTTP INSTEAD OF HTTPS
					if(tUrl.indexOf('https:') != -1){
						textract.fromUrl(tUrl.replace(/^https:\/\//i, 'http://'), function( nerror, ntext ) {
							if(!nerror){
								return resolve(ntext);
							}else{
								return reject(nerror);
							}
						})
					}else{
						return reject(error);
					}
					
				}
			});
		// })

	}).catch((error) => {
    	console.log('attachment error - ', tUrl);
    	console.log(error);
    	return('')
    });
}

exports.get_content = function(tUrl){
	return new Promise(function (resolve, reject) {
		get_link_type(tUrl).then(function(thisType){
			if(thisType.type == "document"){
				get_file(tUrl).then(function(retData){
					return resolve ({
						html : '<html><head></head><body>'+retData+'</body></html>',
						text : retData,
						links : []
					})
				}).catch((error) => {
			    	console.log('document content error - ', tUrl);
			    	console.log(error);
			    	return reject(error);
			    });
			}else{
				request(tUrl, function(error, response, html){
					if(!error){
						var ret_obj = unfluff(html);
						ret_obj.html = html;
						return resolve(ret_obj);
			        }else{
			        	return reject(error);
			        }
				});
			}			
		}).catch((error) => {
	    	console.log('item error - ',tUrl, error)
			return reject(error);
	    })
	}).catch((error) => {
    	console.log('process error - ',tUrl, error)
    })
}

var get_link_type = function(url){
	return new Promise(function (resolve, reject) {
		console.log(url)
		url = url.split(/[?#]/)[0];
		var link = {};
		var re = /(?:\.([^.]+))?$/;
		// var known_file_exts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'odp', 'otp'];
		var known_file_exts = ['pdf'];
		var known_img_exts = ['png', 'jpg', 'jpeg', 'gif', 'tiff'];
			link.ext = re.exec(url)[1];
			link.type = (known_file_exts.indexOf(link.ext) == -1 ? (known_img_exts.indexOf(link.ext) == -1 ? 'webpage' : 'image') : 'document');
		return resolve({ext: link.ext, type:link.type});
	})
}

// exports.get_links_content = function(links, baseUrl){
// 	return new Promise(function (resolve, reject) {
// 		var attachments = [];
// 		var ret_att = '';
// 		links.forEach(function(link, i){
// 			console.log(link.href)
// 			get_link_type(link.href)
// 			.then(function(ret_data){
// 				if(ret_data.type == "document"){
// 					attachments.push({
// 						ext : ret_data.ext,
// 						type : ret_data.type,
// 						href : link.href,
// 					})
// 				};
// 			}).catch((error) => {
// 		    	console.log('link item - ', error)
// 			   	return reject(error);
// 		    })
// 		})
// 		var count = 0;
// 		function get_item_content(a){
// 			console.log(a)
// 			get_file(a.href, baseUrl)
// 			.then(function(data){
// 				ret_att += data;
// 				count++;
// 				if(count == attachments.length || !attachments[count] ){
// 					return resolve(ret_att);
// 				}else{
// 					get_item_content(attachments[count]);
// 				}
// 			}).catch((error) => {
// 				console.log('link content - ',tUrl, error)
// 				return reject(error);
// 			})
// 		}
// 		get_item_content(attachments[count]);
// 	})
// }

exports.get_links_content = function(links, baseUrl){
	return new Promise(function (resolve, reject) {
		var attachments = [];
		var ret_att = '';
		return Promise.all(links.map(function(link){
			console.log('test-------',link)
			get_link_type(link.href)
			.then(function(ret_data){
				if(ret_data.type == "document"){
					attachments.push({
						ext : ret_data.ext,
						type : ret_data.type,
						href : link.href,
					})
				};
			})
		})
		)
		.then(function(){
			var proms = [];
			attachments.map(function(a){
				proms.push(get_file(a.href, baseUrl)
				.then(function(data){
					ret_att += data;
				}));
			})
			var items = Promise.all(proms);
			items.then(function(){
				return resolve(ret_att);
			})
		})
	})
}

exports.get_content_from_html = function(html){
	return new Promise(function (resolve, reject) {
		html = '<html><head></head><body>'+html+'</body></html>';
		var retObj = unfluff(html);
		retObj.html = html;
		return resolve(retObj);
	})
}