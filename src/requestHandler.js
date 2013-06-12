var url = require('url');
var util = require('util');
var nsupdate = require('./nsupdate');

// * expect the key to be in the form "name:secret" (for nsupdate's -y option)
// * accept lower alphanum characters, dashes and dots as 'name'
// * accept MIME-style Base64 safe values as 'secret'
var KEY_RE = /^[a-z0-9\-\.]+\:[a-zA-Z0-9\/\+]+\=?\=?$/;

module.exports = function(req, res) {
  console.log("Incoming request: " + req.method + " " + req.url);
  if(req.method === 'POST') {
    var parsedUrl = url.parse(req.url, true);
    console.log('parsed url', parsedUrl)
    var query = parsedUrl.query;
    if(! (query && query.key)) {
      console.log("Rejecting (missing \"key\" parameter)");
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.write("Bad Request:\n");
      res.write("  missing \"key\" parameter\n");
      res.end();
    } else if(KEY_RE.test(query.key)) {
      console.log("Reading request body...");
      var body = '';
      req.on('data', function(chunk) { body += chunk; });
      req.on('end', function() {
        console.log("Body done, processing request...");
        nsupdate.run(query.key, body, function(error) {
          if(error) {
            console.log("Error occured: " + error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write("ERROR: " + util.inspect(error) + "\n");
          } else {
            console.log("nsupdate done, success!");
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write("Success!\n");
          }
          res.end();
        });
      });
    } else {
      console.log("Rejecting (invalid key)");
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.write("Bad Request:\n");
      res.write("  invalid \"key\" parameter (must be in the form \"keyname:secret\")\n");
      res.end();
    }
  } else {
    console.log("Rejecting (method not allowed)");
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.write("Method not allowed\n");
    res.end();
  }
};
