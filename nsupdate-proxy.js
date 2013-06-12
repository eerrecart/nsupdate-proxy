#!/usr/bin/env node

var config = require('./config');

var PORT = config.port;

var fs = require('fs');
var http = require('http');
var https = require('https');
var requestHandler = require('./src/requestHandler');

if(config.ssl) {
  https.createServer({
    key: fs.readFileSync(config.keyPath),
    cert: fs.readFileSync(config.certPath)
  }, requestHandler).listen(PORT, function() {
    console.log("Secure server listening on port " + PORT);
  });
} else {
  http.createServer(requestHandler).listen(PORT, function() {
    console.log("Testing server listening on port " + PORT);
  });
}
