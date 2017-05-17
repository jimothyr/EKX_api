var request = require('request');
var appGlobals = require('../globals/globals.json');


// 
// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║                                                                                                                      ║
// ║                                            ADDING / UPDATING RECORDS                                                 ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                                                                                      ║
// ║                                                                                                                      ║
		// --------------------------------------------------------┤ ADD OR UPDATE A RECORD IN ELASTICSEARCH
		var add_update = function(data){
			return new Promise(function (resolve, reject) {
				request({
					url: appGlobals.searchURL+appGlobals.searchShard+'/'+appGlobals.searchType+(data.guid ? '/'+data.guid : ''),
					method: "POST",
					json: true,
					auth: appGlobals.indexAuth,
					body: data
				}, 
				function (error, response, body){
					if(error){
						return reject(error);
					}else{
						if(body.result){
							var attachCount = ''
							return resolve(response);
						}else{
							console.log(body)
						}
					}
				});
			});
		}

		// --------------------------------------------------------┤ PRETEND TO WRITE TO ELASTICSEARCH - WRITES A FILE IN PERSISTANT DATA
		var fake_update = function(data){
			var fs = require('fs');
			return new Promise(function (resolve, reject) {
				console.log('-----writing ',data.guid )
				fs.writeFile(process.env.OPENSHIFT_DATA_DIR+"Fake/"+data.guid+'.js', JSON.stringify(data), function(err) {
					if(err) {
						reject(err);
					}
		    		return resolve("The file was saved! - "+data.url);
				}); 
			});
		}

		// --------------------------------------------------------┤ API
		exports.index = function(doc, callback){
			add_update(doc).then(function(){
				callback('done');
			});
			// fake_update(doc).then(function(){
			// 	callback('done');
			// });
		}
// ║                                                                                                                      ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                END OF SECTION                                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// 





// 
// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║                                                                                                                      ║
// ║                                           		 FUNCITONS                                                   		  ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                                                                                      ║
// ║                                                                                                                      ║
		// --------------------------------------------------------┤ CONVERT A PROVIDER GUID INTO AN INTEGER
		var create_guid = function(guid){
			function hashCode(str) {
			  return str.split('').reduce((prevHash, currVal) =>
			    ((prevHash << 5) - prevHash) + currVal.charCodeAt(0), 0);
			}
			return hashCode(guid);
		}

		// --------------------------------------------------------┤ API
		exports.get_guid = function(guid){
			return(create_guid(guid));
		}
// ║                                                                                                                      ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                END OF SECTION                                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// 






// 
// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║                                                                                                                      ║
// ║                                            	FIND ITEMS                                                 			  ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                                                                                      ║
// ║                                                                                                                      ║
		// --------------------------------------------------------┤ FIND IF A GUID EXISTS
		var does_guid_exist = function(guid){
			return new Promise(function (resolve, reject) {
				request({
			    	url: appGlobals.searchURL+appGlobals.searchShard+"/_search",
			    	method: "POST",
			    	json: true,
			    	auth: appGlobals.indexAuth,
				    body:{
				    	"query": {
						   "terms": {
						      "_id": guid 
						    }
						}
				    }
				}, 
				function (error, response, body){
				    if(error){
						return reject(error);
					}else{
						return resolve(body.hits ? body.hits.hits : []);
					}
				});	
			});
		}


		// --------------------------------------------------------┤ FIND A SPECIFIC ITEM BY GUID
		exports.getByGUID= function(guid){
			return new Promise(function (resolve, reject) {
				request({
				    url: appGlobals.searchURL+appGlobals.searchShard+"/_search",
				    method: "POST",
				    json: true,   // <--Very important!!!
				    auth: appGlobals.indexAuth,
				    body:{
				    	"query": {
							"term" : { 
								"guid" : guid
							} 
						}
				    }
				}, function (error, response, body){
				   var hits;
				   console.log(hits)
				    if(body.hits){
				    	hits = body.hits.hits;
				    }else{
				    	hits = [];
				    }
					return resolve(hits);
				});
			}).catch((error) => {
		        console.log('guid search - ', error)
		    })
		}

// ║                                                                                                                      ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                END OF SECTION                                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// 





// 
// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║                                                                                                                      ║
// ║                                            RELATED FUNCTIONS           	                                          ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                                                                                      ║
// ║                                                                                                                      ║
		// --------------------------------------------------------┤ ALL RELATED
		exports.getRelated = function(keywords, guid, reqUrl, resUrl){
			return new Promise(function (resolve, reject) {
				request({
				    url: appGlobals.searchURL+appGlobals.searchShard+"/_search",
				    method: "POST",
				    json: true,   // <--Very important!!!
				    auth: appGlobals.indexAuth,
			    	body: {
			    		"_source": {
					        "exclude": [ "attachments.*", "links.*", "content.*" ]
					    },
			    		"query": {
					        "match" : {
					            "_all" : keywords
					        }
					    },
						"suggest" : {
							"suggestion" : {
								"text" : keywords,
								"term" : {
									"field" : "_all"
								}
							}
						},
						"size" : 100,
						"min_score": 1.7
					}
				}, function (error, response, body){
				    var hits;
				    if(body.hits){
				    	hits = body.hits.hits.reduce(function(memo, hit) {
						    if (hit.guid != guid) {
						    	// --------------------------------------------------------┤ CONVERT LINKS INTO BOUNCING LINKS
						    	hit._source.link = resUrl+'/'+appGlobals.bounceRoute+'/'+encodeURIComponent(new Buffer(reqUrl).toString('base64'))+'/'+encodeURIComponent(new Buffer(hit._source.link).toString('base64'));
						    	hit._source.url = hit._source.link;
						        memo.push(hit);
						    }
						    return memo;
						}, []);
				    }else{
				    	hits = [];
				    }  
					resolve(hits);
				});
			}).catch((error) => {
			    console.log('search - ', error)
		   })
		}
// ║                                                                                                                      ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                END OF SECTION                                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
//





// 
// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║                                                                                                                      ║
// ║                                           ELASTICSEARCH FUNCTIONS                                                    ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                                                                                      ║
// ║                                                                                                                      ║
		// --------------------------------------------------------┤ CREATE INDEX AND MAPPINGS
		exports.createIndex = function(){
			return new Promise(function (resolve, reject) {
				request({
			    	url: appGlobals.indexURL+appGlobals.searchShard,
			    	method: "PUT",
			    	json: true,
			    	auth: appGlobals.indexAuth,
				    body:{
						"settings" : {
					        "number_of_shards" : 1
					    },
					    "mappings" : {
						    "ekxIndex" : {
						    	"_source" : {
						    		"excludes" : [
										"pdfs"
							    	]
						    	}
					        }
				        }
				    }
				}, 
				function (error, response, body){
				    if(error){
						reject(error);
					}else{
						resolve(response);
					}
				});
			})
		}
// ║                                                                                                                      ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                END OF SECTION                                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// 
 