const http         = require('http'),
      express      = require('express'),
      bodyParser   = require('body-parser'),
      Fingerprint = require('express-fingerprint'),
      fs           = require('fs'),
      path         = require('path'),
      contentTypes = require('./utils/content-types'),
      sysInfo      = require('./utils/sys-info'),
      services     = require('./services/services/get_services'),
      search       = require('./services/search/elasticsearch'),
      appGlobals   = require('./services/globals/globals.json'),
      bounces      = require('./bounce/bounce'),
      ingest      = require('./services/feeds/ingest'),
      ukerc       = require('./services/ukerc/ukerc'),
      env          = process.env;

var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    }));
    app.use(Fingerprint({
      parameters:[
        Fingerprint.useragent,
        Fingerprint.acceptHeaders,
        Fingerprint.geoip,
      ]
    }));

// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║                                                                                                                      ║
// ║                                                 PUBLIC ROOTS                                                         ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                                                                                      ║
// ║  
      // --------------------------------------------------------┤ HEALTH - REQUIRED BY OPENSHIFT
      app.get('/health', function(req, res){
        res.writeHead(200);
        res.end();
      });

      // --------------------------------------------------------┤ SYSTEM STATUS
      app.get('/info/gen', function(req, res){
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store');
        res.end(JSON.stringify(sysInfo['gen']()));
      });
      app.get('/info/poll', function(req, res){
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store');
        res.end(JSON.stringify(sysInfo['poll']()));
      });

      // --------------------------------------------------------┤ RECORD A LINK CLICK
      app.post('/'+appGlobals.bounceRoute, function(req, res){
        var tto = search.decrypt(req.body.q).split('|');
        bounces.bounce(req.get('Referrer'), tto[0], tto[1], tto[2], tto[3], req.fingerprint.hash);
        res.redirect(tto[0]);
      });

      // --------------------------------------------------------┤ GET SERVICES
      app.post('/api/:method/:action', function(req,res){
        res.setHeader('Access-Control-Allow-Origin','*');
        res.setHeader('Content-Type', 'application/json');
        var setData = req.body;
        setData.action = (req.params.method == 'service' ? (req.params.action == 'all' ? 'all' : req.params.action.split(',')) : []);
        setData.type = (req.params.method == 'type' ? (req.params.action == 'all' ? 'all' : req.params.action.split(',')) : []);
        services.getServices(setData)
        .then(function(ret_obj){
          res.send(ret_obj);
        });
      });

      app.post('/api/:method', function(req,res){
        res.setHeader('Access-Control-Allow-Origin','*');
        res.setHeader('Content-Type', 'application/json');
        var setData = req.body;
        setData.action = (req.params.method == 'service' ? 'all' : []);
        setData.type = (req.params.method == 'type' ? 'all' : []);
        services.getServices(setData)
        .then(function(ret_obj){
          res.send(ret_obj);
        });
      });

      // --------------------------------------------------------┤ LIST SERVICES
      app.get('/api/:method', function(req,res){
        res.setHeader('Access-Control-Allow-Origin','*');
        res.setHeader('Content-Type', 'application/json');
        res.send(services.listServices(req.params.method));
      });
      app.get('/api', function(req,res){
        res.setHeader('Access-Control-Allow-Origin','*');
        res.setHeader('Content-Type', 'application/json');
        res.send(services.listServices());
      });

      // --------------------------------------------------------┤ CHECK IF AN RSS FEED IS A VALID RSS FEED
      app.post('/rss/check', function(req,res){
        res.setHeader('Access-Control-Allow-Origin','*');
        res.setHeader('Content-Type', 'application/json');
        ingest.check_valid_feed(req.body.feed, res);
      })

// ║                                                                                                                      ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                END OF SECTION                                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// 






// 
// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║                                                                                                                      ║
// ║                                                PRIVATE ROOTS                                                         ║
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                                                                                      ║
// ║                                                                                                                      ║
// ║                                                                                                                      ║
    // --------------------------------------------------------┤ CREATE THE SEARCH INDEX
    app.get('/createIndex/:shard', function(req, res){
      search.createIndex(req.params.shard)
      .then(function(resObj){
        res.send(resObj)
      })
      .catch((error) => {
          console.error('search - ', error)
          return reject(error);
       })
    });

    // --------------------------------------------------------┤ INGEST FEEDS
    app.get('/ingestFeeds', function(req,res){
      ingest.ingest_feeds();
      res.send('Request acknowledged');
    })

    // --------------------------------------------------------┤ BROWSER EXTENSION GET RELATED
    app.post('/getFromURL/', function(req, res){
      res.setHeader('Access-Control-Allow-Origin','*');
      res.setHeader('Content-Type', 'application/json');      
      services.getHTMLContent(req.body.url)
      .then(function(retObj){
        res.send(retObj);
      })
    })
    // --------------------------------------------------------┤ BROWSER EXTENSION INGEST FROM URL
    app.post('/saveFromUrl', function(req, res){
      res.setHeader('Access-Control-Allow-Origin','*');
      if(req.params.rating > 0){
				ingest.process_items([{link: req.body.url, userRating: req.body.rating, searchShard: appGlobals.extensionShard, guid: encodeURIComponent(req.body.url)}]);
			}
      res.send('thanks');
    })

    // --------------------------------------------------------┤ WEB CRAWLER INGEST FROM HTML
    app.post('/crawlerIngest', function(req, res){
      res.setHeader('Access-Control-Allow-Origin','*');
      var processItems = [];
      body.items.forEach(function(e, i) {
        processItems.push({
          link: req.body.url, 
          searchShard: appGlobals.crawlerShard, 
          guid: encodeURIComponent(req.body.url)
        })
      });
      ingest.process_items();
      res.send('this might take a while');
    })
    
    // --------------------------------------------------------┤ UKERC DEMO - GET SEARCH PAGE
    app.get('/UKERCsearch/:sTerm', function(req,res){
      ukerc.getSearchPost(req.params.sTerm)
      .then(function(data){
        res.setHeader('Access-Control-Allow-Origin','*');
        res.setHeader('Content-Type', 'application/json');  
        res.send(data);
      });
    })

    app.get('/UKERCpage', function(req,res){
      ukerc.getPage(req.query.link)
      .then(function(data){
        res.setHeader('Access-Control-Allow-Origin','*');
        // res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Type', 'application/json');          
        res.send(data);
      })
    })
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                END OF SECTION                                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
//
app.listen(env.NODE_PORT || 3003, env.NODE_IP || 'localhost', function () {
  console.log(`Application worker ${process.pid} started...`);
});