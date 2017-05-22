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
      app.get('/'+appGlobals.bounceRoute+'/:from/:to', function(req, res){
        var tfrom = new Buffer(req.params.from, 'base64').toString();
        var tto = new Buffer(req.params.to, 'base64').toString();
        bounces.bounce(tfrom,tto, req.fingerprint.hash);
        res.redirect(tto);
      });

      // --------------------------------------------------------┤ SERVICES FROM API MANAGER
      app.post('/services/:action', function(req, res) {
        console.log(req.params.action)
        var setData = req.body;
        // setData.action = [];
        setData.guid = search.get_guid(setData.itemID, setData.providerID);
        services.getServices(setData, req.headers.origin, req.protocol + '://' + req.get('host'))
        .then(function(ret_obj){
          res.send(ret_obj);
        });
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

// ║                                                                                                                      ║
// ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
// ║                                                END OF SECTION                                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
//
app.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {
  console.log(`Application worker ${process.pid} started...`);
});
