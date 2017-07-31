var FeedParser    = require('feedparser'),
    request       = require('request');

var search_engine = require('../search/elasticsearch'),
    content       = require('../content/get_content'), 
    services      = require('../services/get_services'),
    events        = require('../events/eventbrite'),
    appGlobals    = require('../globals/globals.json');


// 
// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║                                                                                                                      ║
// ║                                            GET THE ITEMS FROM A FEED                                                 ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                                                                                      ║
// ║                                                                                                                      ║
    // --------------------------------------------------------┤ GET RSS FEED ITEMS
    var get_items = function(url, provider, feedId){
      return new Promise(function (resolve, reject) {
        var req = request(url);
        var feedparser = new FeedParser();
        req.on('error', function (error) {
          reject(error);
        });

        req.on('response', function (res) {
          var stream = this; 

          if (res.statusCode !== 200) {
            this.emit('error', new Error('Bad status code'));
          }
          else {
            stream.pipe(feedparser);
          }
        });
        
        var items = [];
        feedparser.on('error', function (error) {
          reject(error);
        });
        feedparser.on('end', function(){
          resolve(items);
        });
        feedparser.on('readable', function () {
          var stream = this; 
          var meta = this.meta;
          var item;  
          while (item = stream.read()) {
            items.push({
              guid : search_engine.get_guid(item.guid,provider),
              item_guid : item.guid,
              feed_id : feedId,
              feed_url : url,
              provider : provider,
              categories : item.categories,
              date : item.date,
              pubDate : item.pubDate,
              url : item.guid,
              author : item.author,
              summary : item.summary,
              title : item.title,
              description : item.description,
              link : item.link
            });
          }
        });
      }).catch((error) => {
        console.log('get item error', error)
      });
    }

    // --------------------------------------------------------┤ GET EVENTBRITE EVENT ITEMS
    var get_events = function(id, providerName){
      return new Promise(function (resolve, reject) {
        console.log('--------------┤ FETCHING EVENTS FOR - ' + providerName)
        events.getEvents(id)
        .then(function(results){
          for(var i=0;i<results.length;i++){
            results[i].provider = providerName;
          }
          return resolve(results);
        }).catch((error) => {
          console.log('get event error', error)
        });
      }).catch((error) => {
        console.log('get event error', error)
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
// ║                                        PROCESS EACH ITEM WITH SERVICES                                               ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                                                                                      ║
// ║                                                                                                                      ║
    
    var completeIngest = function(providers){
      providers.forEach(function(p,i){
        request({
          url: appGlobals.managerURL+'/update-feed-date/?providerId='+p,
          method: "GET",
          json: true,
        }, 
        function (error, response, body){
          if(error){
            console.log(error);
          }
        });
      })
      console.log('║                                                                                                                      ║');
      console.log('║                                                                                                                      ║');
      console.log('╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣');
      console.log('║                                               INGEST COMPLETE                                                        ║');
      console.log('╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝');
    }

    var process_items = exports.process_items = function(items){
      var count = 0, providers=[];
      function process_item(item){
        if(!providers.includes(item.provider.id)){
          providers.push(item.provider.id);
        }
        // --------------------------------------------------------┤ TODO: PROCESS A COMMA SEPERATED LIST OF URLS ENTERED AS A SINGLE URL (LILO ENA :\  )       
        var linkUrl = (item.link ? item.link : item.url);      
        console.log('--------------------------------------------------------┤ PROCESSING - ' + linkUrl + ' ' + item.guid)
        // --------------------------------------------------------┤ GET THE CONTENT
        content.get_content(linkUrl)
        .then(function(ret_content){
          if(ret_content){
            item.content = {
              html: ret_content.html,
              text:ret_content.text,
              links:ret_content.links
            };
          }else{
            item.content = {
              html: item.description,
              text: item.description,
              links:[]
            };
          }
          
          // --------------------------------------------------------┤ GET ATTACHMENT CONTENT
          return content.get_links_content(item.content.links, linkUrl)
        }).then(function(ret_atttachments){
          if(item.content.links){
            delete item.content.links;
          }
          if(ret_atttachments){
            if(ret_atttachments.length > 0){
              item.content.pdfs = ret_atttachments;
            }
          }
          // --------------------------------------------------------┤ GET ALL THE OTHER SERVICES WE WANT
          return services.itemServices(item, [], 'info')
        }).then(function(indexObj){
          if(item.content){
            for(var k in indexObj){
              if(indexObj[k]){
                if(!indexObj[k].error){
                  item[k] = indexObj[k];
                }
              } 
            }

            // --------------------------------------------------------┤ IF THIS ITEM HAS COME FROM A USER, ADD THE USER RATING
            if(item.userRating){
              indexObj.userRating = item.userRating;
            }

            // --------------------------------------------------------┤ ADD THE OBJECT TO THE SEARCH ENGINE
            console.log('-------------------------┤ INDEXING '+count+' of '+ items.length);
            search_engine.index(item, function(){
              count++;
              item = null;
              indexObj = null;
              if(count < items.length){
                process_item(items[count]);
              }else{
                completeIngest(providers);
              }
            });
          }else{
            console.log('-------------------------┤ COULD NOT INDEX '+count+' of '+ items.length)
            count++;
            item = null;
            if(count < items.length){
              process_item(items[count]);
            }else{
               completeIngest(providers);
            }
          }
          
        }).catch((error) => {
          console.error('fetch error')
          console.error(error)
          item = null;
          indexObj = null;
        })
      }
      process_item(items[count]);
    }
// ║                                                                                                                      ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                END OF SECTION                                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// 

var get_feeds = function(providerId){
  return new Promise(function (resolve, reject) {
    request({
      url: appGlobals.managerURL+'/feeds-json/'+(provider_id ? '?providerId='+providerId : ''),
      method: "GET",
      json: true,
    }, 
    function (error, response, body){
      if(error){
        return reject(error);
      }else{
        if(body.result){
          return resolve(response);
        }else{
          console.log(body)
        }
      }
    });
  });
}

exports.ingest_feeds = function(provider_id){
 console.log('╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗');
 console.log('║                                                                                                                      ║');
 console.log('║                                                STARTING INGEST                                                       ║');
 console.log('║                                                                                                                      ║');
 console.log('╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣');
 console.log('║                                                                                                                      ║');
 console.log('║                                                                                                                      ║');

 get_feeds(provider_id)
 .then(function(providers){
    var feedProms = [];
    var eventProms = [];

    providers.map(function(p){
      if(p.feeds){
        p.feeds.map(function(f){
          feedProms.push(get_items(f.url, p.provider, f.id))
        });
      }

      if(p.eventbrite){
        p.eventbrite.map(function(e){
          eventProms.push(get_events(e.id, p.provider.name))
        });
      }
    });
    var feedItems = Promise.all(feedProms);
    var eventItems = Promise.all(eventProms);

    feedItems.then(function(results){
      // --------------------------------------------------------┤  OUR RETURNED ARRAY IS ACTUALLY AN ARRAY OF ARRAYS WHICH IS USELESS. AS WE SEND IT OFF TO THE PROCESSING FUNCTION, WE FLATTEN IT OUT.
      process_items([].concat.apply([], results));
    }).catch((error) => {
      console.error('ingest error', error)
    });

    eventItems.then(function(results){
      var events = [].concat.apply([], results);
      events.forEach(function(e,i){
        search_engine.add_event(e);
      })
    }).catch((error) => {
      console.error('ingest error', error)
    });
 })


}

exports.check_valid_feed = function(feed_url){
  // var req = request(feed_url);
  // var feedparser = new FeedParser();
  // req.on('error', function (error) {
  //   reject(error);
  // });

  // req.on('response', function (res) {
  //   return res;
  // });
  request.get(feed_url)
  .on('response', function(response) {
    console.log(response) // 200 
    return(response) // 'image/png' 
  })
}