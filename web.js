var express = require('express');
var app = express.createServer(express.logger());

var fs = require('fs');
var txt = fs.readFileSync('index.html');
buf = new Buffer(txt, 'utf-8');

app.get('/', function(request, response) {
  response.send(buf.toString('utf-8'));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
