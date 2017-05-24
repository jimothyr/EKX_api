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
      // app.get('/'+appGlobals.bounceRoute, function(req, res){
      //   // res.send(JSON.stringify(req.fingerprint));

      //   var tfrom = req.headers.origin;
      //   var tto = req.query[appGlobals.bounceTo];
      //   // var retUrl = search.decrypt(tto);
      //   // retUrl = retUrl.split('|');
      //   res.send([tfrom, tto, req.fingerprint]);
      //   // console.log(retUrl)
      //   // // bounces.bounce(tfrom,tto, req.fingerprint.hash);
      //   // res.redirect(retUrl[0]);
      // });

      app.post('/'+appGlobals.bounceRoute, function(req, res){
        var tfrom = req.headers.origin;
        var tto = search.decrypt(req.body.q);
        console.log(tto);
        res.send(req.headers);
      });

      // --------------------------------------------------------┤ GET SERVICES
      app.post('/api/:method/:action', function(req,res){
        res.setHeader('Content-Type', 'application/json');
        var setData = req.body;
        setData.action = (req.params.method == 'service' ? (req.params.action == 'all' ? 'all' : req.params.action.split(',')) : []);
        setData.type = (req.params.method == 'type' ? (req.params.action == 'all' ? 'all' : req.params.action.split(',')) : []);
        services.getServices(setData)
        .then(function(ret_obj){
          res.send(ret_obj);
        });
      });

      app.post('/api/:method', function(reqm,res){
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
        res.setHeader('Content-Type', 'application/json');
        res.send(services.listServices(req.params.method));
      });
      app.get('/api', function(req,res){
        res.setHeader('Content-Type', 'application/json');
        res.send(services.listServices());
      });

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
    app.get('/createIndex', function(req, res){
      search.createIndex()
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
// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                END OF SECTION                                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
//
app.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {
  console.log(`Application worker ${process.pid} started...`);
});
