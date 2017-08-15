var content = require('../content/get_content');
var keywords = require('../keywords/get_keywords');
var search = require('../search/elasticsearch');
var social = require('../social/get_social');
var summary = require('../summary/get_summary');
var organisations = require('../organisations/bridgelight');
var eng_lang_score = require('../eng_lang/get_els');
var people = require('../people/get_people');
var people = require('../people/get_people');
var funding = require('../funding/researchGateway');
var datasets = require('../data/getData');

// 
// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║                                                                                                                      ║
// ║                                            SERVICES EVERYTHING NEEDS                                                 ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                                                                                      ║
// ║                                                                                                                      ║
		var globalServices = {
			content : function(data){
				var ret_obj={name: 'content'};
				return new Promise(function (resolve, reject) {
					if(!data.html){
						ret_obj.data = {'error' : 'invalid content'};
						return resolve (ret_obj);
					}
		 			content.get_content_from_html(decodeURIComponent(data.html))
					.then(function(ret_content){
						ret_obj.data = ret_content;
						return resolve (ret_obj);
					}).catch((error) => {
				    	console.log('content error - ', error)
				    	return reject(error)
				    })
				}).catch((error) => {
			        console.log('content - ', error)
				    return reject(error)
			    });
			},	
			guid : function(guid){
				return new Promise(function (resolve, reject) {
					search.getByGUID(guid)
					.then(function(retObj){
						return resolve(retObj);
					})
					.catch((error) => {
				        console.log('improper guid - ', error)
				        return reject(error);
				    });
				});
			},
			emptyProm : function(){
				return new Promise(function (resolve, reject) {
					return resolve();
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
		var services = {
			keywords : {
				types : ['info'],
				action : function(data){
							var ret_obj={name: 'keywords'};
							return new Promise(function (resolve, reject) {
								if(!data.content.text){
									ret_obj.data = {'error' : 'invalid content'};
									return resolve (ret_obj);
								}
								keywords.get_keywords(data.content.text + (data.content.pdfs?data.content.pdfs:''))
								.then(function(ret_keywords){
									ret_obj.data = {
										keywords : ret_keywords,
										string : ret_keywords.map(function(k){return k.term}).join()
									}
									for(var i=0;i<ret_keywords.length;i++){
										ret_obj.data['keyword_'+i] = ret_keywords[i].term;
									}
									return resolve (ret_obj);
								}).catch((error) => {
					        	console.log('keyword - ', error)
						        return reject(error);
					    	});
							})
						}
					},
			summary : {
				types : ['info'],
				action : function(data){
					var ret_obj={name: 'summary'};
					return new Promise(function (resolve, reject) {
						if(!data.content.text){
							ret_obj.data = {'error' : 'invalid content'};
							return resolve (ret_obj);
						}
						summary.get_summary(data.content.html)
						.then(function(ret_summary){
							ret_obj.data = ret_summary
							return resolve(ret_obj);
						}).catch((error) => {
			        		console.log('summary - ', error)
			   			});
					});
				}
			},
			datasets : {
				types : ['related'],
				action : function(data){
					var ret_obj={name: 'datasets'};
					return new Promise(function (resolve, reject) {
						if(!data.keywords.string){
							ret_obj.data = {'error' : 'invalid keywords'};
							return resolve (ret_obj);
						}
						datasets.get_data(data.keywords.string, data.providerId)
						.then(function(ret_data){
							ret_obj.data = ret_data
							return resolve(ret_obj);
						}).catch((error) => {
				        	console.log('datasets - ', error)
				        	return reject(error);
						});
					})
				}
			},
			eng_lang_score :{
				types : ['info'],
				action :  function(data){
					var ret_obj={name: 'eng_lang_score'};
					return new Promise(function (resolve, reject) {
						if(!data.content.text){
							ret_obj.data = {'error' : 'invalid content'};
							return resolve (ret_obj);
						}else{
							eng_lang_score.get_score(data.content.text)
							.then(function(ret_score){
								ret_obj.data = ret_score;
								return resolve(ret_obj);
							}).catch((error) => {
					    console.log('eng lang error - ', error)
				        return reject(error);
					});
						}
						
					})
				}
			},
			people : {
				types : ['info'],
				action : function(data){
					var ret_obj={name: 'people'};
					return new Promise(function (resolve, reject) {
						if(!data.content.text){
							ret_obj.data = {'error' : 'invalid content'};
							return resolve (ret_obj);
						}else{
							people.get_people(data.content.text + (data.content.pdfs?data.content.pdfs:'') + (data.author?data.author:''))
							.then(function(ret_people){
								ret_obj.data = ret_people;
								return resolve(ret_obj);
							}).catch((error) => {
				        console.log('people - ', error)
				        return reject(error);
				    });
						}
						
					})
				}
			},
			organisations : {
				types : ['related'],
				action : function(data){
					var ret_obj={name: 'organisations'};
					return new Promise(function (resolve, reject) {
						if(!data.keywords.string){
							ret_obj.data = {'error' : 'invalid keywords'};
							return resolve (ret_obj);
						}
						organisations.get_organisations(data.keywords.string, data.providerId)
						.then(function(ret_organisation){
							ret_obj.data = ret_organisation
							return resolve(ret_obj);
						}).catch((error) => {
				        console.log('organisations - ', error)
				        return reject(error);
				    });
					})
				}
			},
			documents : {
				types : ['related'],
				action : function(data){
					var ret_obj={name: 'documents'};
					return new Promise(function (resolve, reject) {
						if(!data.keywords.string){
							ret_obj.data = {'error' : 'invalid keywords'};
							return resolve (ret_obj);
						}
						search.getRelated(data.keywords.string,data.providerId,(data.guid ? data.guid : 0))
						.then(function(ret_related){
							ret_obj.data = ret_related
							return resolve(ret_obj)
						}).catch((error) => {
				        console.log('related - ', error)
				        return reject(error);
				    });
					})
				}
			},
			social : {
				types : ['related'],
				action : function(data){
					var ret_obj={name: 'social', data:{}};
					return new Promise(function (resolve, reject) {
						var proms = [];
						if(!data.keywords.string){
							ret_obj.data = {'error' : 'invalid keywords'};
							return resolve (ret_obj);
						}
						proms.push(
							social.get_stackExchange(data.keywords.string)
							.then(function(ret_se){
								ret_obj.data.stackExchange = ret_se;
								// return resolve(ret_obj);
							}).catch((error) => {
								console.log('social - ', error)
							})
						)
						proms.push(
							social.get_twitter(data.keywords.string)
							.then(function(ret_twitter){
								ret_obj.data.twitter = ret_twitter;
								// return resolve(ret_obj);
							}).catch((error) => {
								console.log('social - ', error)
							})
						)
						var items = Promise.all(proms);
						items.then(function(results){
							return resolve (ret_obj);
						});
					})
				}
			},
			events : {
				types : ['related'],
				action : function(data){
					var ret_obj={name: 'events'};
					return new Promise(function (resolve, reject) {
						if(!data.keywords.string){
							ret_obj.data = {'error' : 'invalid keywords'};
							return resolve (ret_obj);
						}
						// search.getEvents(data.keywords.string)
						// .then(function(ret_events){
							// ret_obj.data = {"eventBrite" : ret_events}
							ret_obj.data = {"eventBrite" : []}
							return resolve(ret_obj)
						// }).catch((error) => {
							// console.log('events - ', error)
							// return reject(error);
						// });
					})
				}
			},
			funding : {
				types : ['related'],
				action : function(data){
					var ret_obj={name: 'funding'};
					return new Promise(function (resolve, reject) {
						if(!data.keywords.string){
							ret_obj.data = {'error' : 'invalid keywords'};
							return resolve (ret_obj);
						}
						funding.gatewayProjectSearch(data.keywords.string)
						.then(function(ret_funding){
							ret_obj.data = {"GtR" : ret_funding};
							return resolve (ret_obj);
						}).catch((error) => {
							console.log('funding - ', error)
							return reject(error);
						});
					})					
				}				
			}
		}
// ║                                                                                                                      ║
// ║		                                                                                                              ║
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
		var get_all = function(data, action, type){
			return new Promise(function (resolve, reject) {
				var proms = [];
				var retObj = {};
				for(var s in services){
					if(!retObj[s] && ((services[s].types.some(r=> type.includes(r)) || type == 'all') || (action == 'all' || action.indexOf(s) != -1))){
						if(data[s]){
							retObj[s] = data[s];
						}else{
							proms.push(
								services[s].action(data)
								.then(function(retData){
									retObj[retData.name] = retData.data;
								}).catch((error) => {
							        console.log(s+' - ', error)
							    })
							)	
						}
					}
				}
				proms.push(globalServices.emptyProm())
				var items = Promise.all(proms);
			  	items.then(function(results){
			  		return resolve (retObj);
			  	});
			}).catch((error) => {
		        console.error('get all services - ', error)
		        return reject(error);
		    });	
		}

		// --------------------------------------------------------┤ EXPOSE SERVICES FOR THE INGEST PROCESS
		var itemServices = exports.itemServices = function(data, actions, type){
			return new Promise(function (resolve, reject) {
				get_all(data, actions, type)
				.then(function(sendObj){
	  				return resolve(sendObj);
	  			}).catch((error) => {
			        console.error('item process error - ', error)
			        return reject(error);
			    });
			}).catch((error) => {
		        console.error('item process error - ', error)
		    });	
		}

		// --------------------------------------------------------┤ LIST SERVICES
		exports.listServices = function(retType){
			var retArrr = [];
			for(var s in services){
				if(retType == 'service'){
					retArrr.push(s)
				}else if(retType == 'type'){
					services[s].types.forEach(function(t,i){
						if(!retArrr.includes(t)){
							retArrr.push(t)
						}
					});
				}else{
					retArrr.push({name: s, type : services[s].type})
				}
			}
			return retArrr;
		}

		// --------------------------------------------------------┤ GET RELATED ITEMS FROM HTML
		exports.getHTMLContent = function(tUrl){
			return new Promise(function (resolve, reject) {
				var sendObj = {};
				content.get_content(tUrl)
				.then(function(ret_content){
					sendObj.content = ret_content;
					services.keywords.action(sendObj)
					.then(function(retKeys){
						sendObj.keywords = retKeys.data;
						itemServices(sendObj,['people'],['related'])
						.then(function(retObj){
							retObj.keywords = sendObj.keywords;
							retObj.content = sendObj.content;
							return resolve(retObj);
						}).catch((error) => {
							console.error('ext service - ', error)
							return reject(error);
						})
					}).catch((error) => {
						console.error('ext service - ', error)
						return reject(error);
					})
				}).catch((error) => {
					console.error('ext service - ', error)
					return reject(error);
				})
			}).catch((error) => {
				console.error('ext service - ', error)
				return reject(error);
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
// ║                                            MAIN CALLING FUNCTION                                                     ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                                                                                      ║
// ║                                                                                                                      ║
		var get_services = exports.getServices = function(data){
			return new Promise(function (resolve, reject) {
			if(!data.providerId){
				return resolve ({error:'no providerId'});
			}
			var proms = [], retObj = {providerId : data.providerId};
				if(data.rssItemGUID){
					if(data.rssItemGUID != ''){
						proms.push(
							globalServices.guid(data.rssItemGUID*1)
							.then(function(obj){
								if(obj.length == 0){
									retObj = {error:'not found'};
									return resolve (retObj);
								}else{
									retObj = obj[0]._source;
								}
							}).catch((error) => {
						        console.error('guid service - ', error)
						        return reject(error);
						    })
						)
					}else{
						return resolve ({'error' : 'Not a valid rssItemGUID'});
					}
				}else if(data.html){
					if(data.html != ''){
						proms.push(
							new Promise(function (xresolve, xreject) {
								globalServices.content(data)
								.then(function(ret_content){
									retObj.content = ret_content.data;
									services.keywords.action(retObj)
									.then(function(ret_keys){
										retObj.keywords = ret_keys.data;
										return xresolve();
									}).catch((error) => {
								        console.error('keywords service - ', error)
						        		return reject(error);
								    });	
								}).catch((error) => {
							        console.error('content service - ', error)
						        	return reject(error);
							    })
							})
						)		
					}else{
						return resolve ({'error' : 'Not valid content'});
					}
				}else if(data.keywords){
					if(data.keywords != ''){
						data.keywords = data.keywords.replace(/,/g, '')
						retObj.keywords = {
							keywords : data.keywords.split(' '),
							string : data.keywords
						}
						retObj.content = 'Not available'
					}else{
						return resolve ({'error' : 'Not valid keywords'});
					}
				}else{
						return resolve ({'error' : 'No valid methods - please send a guid from your rss feed, some keywords or some html content next time'});
				}
				
				var items = Promise.all(proms);
			  	items.then(function(results){
					get_all(retObj, data.action, data.type)
		  			.then(function(sendObj){
		  				return resolve(sendObj);
		  			}).catch((error) => {
				        console.error('get services - ', error)
				        return reject(error);
				    });
			  	}).catch((error) => {
			        console.error('service - ', error)
			        return reject(error);
			    });

			}).catch((error) => {
		        console.error('services - ', error)
		        return reject(error);
		    });
		}
// ║                                                                                                                      ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                END OF SECTION                                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// 

