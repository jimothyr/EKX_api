var search = require('../search/elasticsearch');

// 
// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║                                                                                                                      ║
// ║                                            SERVICES EVERYTHING NEEDS                                                 ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                                                                                      ║
// ║                                                                                                                      ║
		var globalServices = {
		// 	content : function(data){
		// 		var ret_obj={name: 'content'};
		// 		return new Promise(function (resolve, reject) {
		// 			if(!data.content){
		// 				ret_obj.data = {'error' : 'invalid content'};
		// 				return resolve (ret_obj);
		// 			}
		//  			content.get_content_from_html(data.content)
		// 			.then(function(ret_content){
		// 				ret_obj.data = ret_content;
		// 				return resolve (ret_obj);
		// 			}).catch((error) => {
		// 		      console.log('content error - ', html)
		// 		    })
		// 		}).catch((error) => {
		// 	        console.log('content - ', error)
		// 	    });
		// 	},	
			guid : function(guid){
				return new Promise(function (resolve, reject) {
					search.getByGUID(data.guid)
					.then(function(retObj){
						return resolve(retObj);
					})
					.catch((error) => {
				        console.log('improper guid - ', error)
				        return reject(error);
				    });
				});
			}
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
// ║                                            SPECIFIC REQUESTABLE SERVICES                                             ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                                                                                      ║
// ║                                                                                                                      ║
		// var services = {
		// 	keywords : function(data){
		// 		var ret_obj={name: 'keywords'};
		// 		return new Promise(function (resolve, reject) {
		// 			if(!data.content.text){
		// 				ret_obj.data = {'error' : 'invalid content'};
		// 				return resolve (ret_obj);
		// 			}
		// 			keywords.get_keywords(data.content.text)
		// 			.then(function(ret_keywords){
		// 				ret_obj.data = {
		// 					keywords : ret_keywords,
		// 					string : ret_keywords.map(function(k){return k.term}).join()
		// 				}
		// 				return resolve (ret_obj);
		// 			});
		// 		}).catch((error) => {
		//         	console.log('keyword - ', error)
		//     	});
		// 	},
		// 	summary : function(data){
		// 		var ret_obj={name: 'summary'};
		// 		return new Promise(function (resolve, reject) {
		// 			if(!data.content.text){
		// 				ret_obj.data = {'error' : 'invalid content'};
		// 				return resolve (ret_obj);
		// 			}
		// 			summary.get_summary(data.content.html)
		// 			.then(function(ret_summary){
		// 				ret_obj.data = ret_summary
		// 				return resolve(ret_obj);
		// 			}).catch((error) => {
		//         		console.log('summary - ', error)
		//    			});
		// 		}).catch((error) => {
		//         	console.log('summary - ', error)
		//    		});
		// 	},
		// 	eng_lang_score : function(data){
		// 		var ret_obj={name: 'eng_l;ang_score'};
		// 		return new Promise(function (resolve, reject) {
		// 			if(!data.content.text){
		// 				ret_obj.data = {'error' : 'invalid content'};
		// 				return resolve (ret_obj);
		// 			}else{
		// 				els.get_score(data.content.text)
		// 				.then(function(ret_score){
		// 					ret_obj.data = ret_score;
		// 					return resolve(ret_obj);
		// 				})
		// 			}
					
		// 		}).catch((error) => {
		// 		    console.log('eng lang error - ', error)
		// 		});
		// 	},
		// 	people : function(data){
		// 		var ret_obj={name: 'people'};
		// 		return new Promise(function (resolve, reject) {
		// 			if(!data.content.text){
		// 				ret_obj.data = {'error' : 'invalid content'};
		// 				return resolve (ret_obj);
		// 			}else{
		// 				people.get_people(data.content.text)
		// 				.then(function(ret_people){
		// 					ret_obj.data = ret_people;
		// 					return resolve(ret_obj);
		// 				})
		// 			}
					
		// 		}).catch((error) => {
		// 	        console.log('people - ', error)
		// 	    });
		// 	},
		// 	organisations : function(data){
		// 		var ret_obj={name: 'organisations'};
		// 		return new Promise(function (resolve, reject) {
		// 			if(!data.keywords.string){
		// 				ret_obj.data = {'error' : 'invalid keywords'};
		// 				return resolve (ret_obj);
		// 			}
		// 			organisations.get_organisations(data.keywords.string)
		// 			.then(function(ret_organisation){
		// 				ret_obj.data = ret_organisation
		// 				return resolve(ret_obj);
		// 			})
		// 		}).catch((error) => {
		// 	        console.log('organisations - ', error)
		// 	    });
		// 	},
		// 	related : function(data){
		// 		var ret_obj={name: 'related'};
		// 		return new Promise(function (resolve, reject) {
		// 			if(!data.keywords.string){
		// 				ret_obj.data = {'error' : 'invalid keywords'};
		// 				return resolve (ret_obj);
		// 			}
		// 			search.getRelated(data.keywords.string, (data.guid ? data.guid : 0), data.requestDomain, data.thisDomain)
		// 			.then(function(ret_related){
		// 				ret_obj.data = ret_related
		// 				return resolve(ret_obj)
		// 			})
		// 		}).catch((error) => {
		// 	        console.log('related - ', error)
		// 	    });
		// 	},
		// 	funding : function(data){
		// 		var ret_obj={name: 'funding'};
		// 		return new Promise(function (resolve, reject) {
		// 			if(!data.keywords.string){
		// 				ret_obj.data = {'error' : 'invalid keywords'};
		// 				return resolve (ret_obj);
		// 			}
		// 			ret_obj.data = {'error' : 'Not currently available'};
		// 			return resolve (ret_obj);
		// 		}).catch((error) => {
		// 	        console.log('funding - ', error)
		// 	    });
		// 	},
		// 	social : function(data){
		// 		var ret_obj={name: 'social'};
		// 		return new Promise(function (resolve, reject) {
		// 			if(!data.keywords.string){
		// 				ret_obj.data = {'error' : 'invalid keywords'};
		// 				return resolve (ret_obj);
		// 			}
		// 			social.get_stackExchange(data.keywords.string)
		// 			.then(function(ret_social){
		// 				ret_obj.data = ret_social
		// 				return resolve(ret_obj);
		// 			})
		// 		}).catch((error) => {
		// 	        console.log('social - ', error)
		// 	    });
		// 	}
		// }
// ║                                                                                                                      ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                END OF SECTION                                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// 




// 
// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║                                                                                                                      ║
// ║                                            FUNCTIONS TO GET SERVICES                                                 ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                                                                                      ║
// ║                                                                                                                      ║
		// --------------------------------------------------------┤ GET EVERYTHING YOU CAN
		var get_all = function(data){
			return new Promise(function (resolve, reject) {
				var proms = [];
				for(var s in services){
					if(!data[s]){
						proms.push(
							services[s](data)
							.then(function(retData){
								data[retData.name] = retData.data;
							}).catch((error) => {
						        console.log(s+' - ', error)
						    })
						)
					}
				}
				var items = Promise.all(proms);
			  	items.then(function(results){
			  		return resolve (data);
			  	});
			}).catch((error) => {
		        console.log('get all services - ', error)
		        return reject(error);
		    });	
		}

		// --------------------------------------------------------┤ GET A SPECIFIC SERVICE
		var get_service = function(data, action){
			return new Promise(function (resolve, reject) {
				if(!data[action]){
					if(services[action]){
						services[action](data)
						.then(function(retData){
							return resolve(retData.data);
						}).catch((error) => {
					        console.log(action, ' - ', error)
					    })
					}else{
						return resolve({"error" : "not a valid service"})
					}
					
				}
			}).catch((error) => {
		        console.log('get single services - ', error)
		        return reject(error);
		    });
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
// ║                                            MAIN CALLING FUNCTION                                                     ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                                                                                      ║
// ║                                                                                                                      ║
		exports.getServices = function(data, reqUrl, resUrl){
			return new Promise(function (resolve, reject) {
				console.log(data)
				search.getByGUID(data.guid)
				.then(function(retObj){
					return resolve(retObj);
				})
				.catch((error) => {
					return reject(error);
			        console.log('improper guid - ', error)
			    });
			});
		}

		// exports.getServices = function(data, reqUrl, resUrl){
		// 	return new Promise(function (resolve, reject) {
		// 	var retObj = {
		// 		requestDomain : reqUrl,
		// 		thisDomain : resUrl
		// 	};
		// 	var proms = [];
		// 		if(data.guid){
		// 			if(data.guid != ''){
		// 				proms.push(
		// 					globalServices.guid(data.guid*1)
		// 					.then(function(obj){
		// 						if(obj.length == 0){
		// 							retObj = {error:'not found'};
		// 							return resolve (retObj);
		// 						}else{
		// 							retObj = obj[0]._source;
		// 						}
		// 					}).catch((error) => {
		// 				        console.log('guid service - ', error)
		// 				    })
		// 				)
		// 			}else{
		// 				return resolve ({'error' : 'Not a valid guid'});
		// 			}
		// 		}else if(data.content){
		// 			if(data.content != ''){
		// 				proms.push(
		// 					globalServices.content(data)
		// 					.then(function(ret_content){
		// 						retObj.content = ret_content.data;
		// 						services.keywords(retObj)
		// 						.then(function(ret_keys){
		// 							retObj.keywords = ret_keys.data;
		// 						}).catch((error) => {
		// 					        console.log('keywords service - ', error)
		// 					    });	
		// 					}).catch((error) => {
		// 				        console.log('content service - ', error)
		// 				    })
		// 				)		
		// 			}else{
		// 				return resolve ({'error' : 'Not valid content'});
		// 			}
		// 		}else if(data.keywords){
		// 			if(data.keywords != ''){
		// 				data.keywords = data.keywords.replace(/,/g, '')
		// 				retObj.keywords = {
		// 					keywords : data.keywords.split(' '),
		// 					string : data.keywords
		// 				}
		// 				retObj.content = 'Not available'
		// 			}else{
		// 				return resolve ({'error' : 'Not valid keywords'});
		// 			}
		// 		}else{
		// 				return resolve ({'error' : 'No valid methods - please send a guid from your rss feed, some keywords or some html content next time'});
		// 		}

		// 		var items = Promise.all(proms);
		// 	  	items.then(function(results){
		// 	  		if(data.action == 'all'){
		// 	  			get_all(retObj)
		// 	  			.then(function(sendObj){
		// 	  				return resolve(sendObj);
		// 	  			}).catch((error) => {
		// 			        console.log('all services - ', error)
		// 			    });
		// 	  		}else{
		// 				get_service(retObj, data.action)
		// 				.then(function(sendObj){
		// 					return resolve(sendObj);
		// 				}).catch((error) => {
		// 			        console.log('specific service - ', error)
		// 			    });
		// 	  		}
		// 	  	});

		// 	}).catch((error) => {
		//         console.log('services - ', error)
		//     });
		// }
// ║                                                                                                                      ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                END OF SECTION                                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// 

