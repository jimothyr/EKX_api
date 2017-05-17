const http         = require('http'),
      express      = require('express'),
      bodyParser   = require('body-parser'),
      fs           = require('fs'),
      path         = require('path'),
      contentTypes = require('./utils/content-types'),
      sysInfo      = require('./utils/sys-info'),
      services     = require('./services/services/get_services'),
      appGlobals   = require('./globals/globals.json'),
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
      app.post('/services', function(req, res) {
        services.getServices(req.body, req.headers.origin, req.protocol + '://' + req.get('host'))
        .then(function(ret_obj){
          res.send(ret_obj);
        });
      });
      app.get('/services/:guid/:action', function(req, res) {
        services.getServices({guid:req.params.guid*1, action:req.params.action}, req.headers.origin, req.protocol + '://' + req.get('host'))
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
