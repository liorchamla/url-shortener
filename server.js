/**
 * FreeCodeCamp URL Shortener Challenge
 * Receive an URL and give a short URL to call it. If the short URL is called, redirects to the real URL
 * @author Lior Chamla
 */
var http = require('http');
var path = require('path');
var express = require('express');
var db = require('mongodb').MongoClient;
var router = express();
var server = http.createServer(router);

// static files (html, css ...)
router.use(express.static(path.resolve(__dirname, 'client')));

// route on GET with a parameter we call :date
router.get('/add/:longURL', function(req, res){
  
  // giving headers for JSON
  res.set({ 'Content-Type': 'application/json' }) 
  // if the date is invalid
  if(!date.getTime()) res.send(JSON.stringify({error: "Invalid date given"}))
  // else, we send the object with two members (unix and natural)
  else res.send(JSON.stringify({
    unix: date.getTime(),
    natural: strftime('%B %d, %Y', date)
  }))
})

// listening to port and processing
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Timestamp microservice listening at", addr.address + ":" + addr.port);
});
