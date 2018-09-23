var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use(express.static('public'));
app.get('/', function(req, res){  res.sendFile(__dirname + '/index.html');});

http.listen(3000,function(){
    console.log('[server online] listening on 3000');
});
