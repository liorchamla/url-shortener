/**
 * FreeCodeCamp URL Shortener Challenge
 * Receive an URL and give a short URL to call it. If the short URL is called, redirects to the real URL
 * @author Lior Chamla
 */
require('dotenv').config();
var http = require('http');
var path = require('path');
var express = require('express');
var mongo = require('mongodb').MongoClient;
var dbURI = 'mongodb://localhost:27017/urlshortener';
var router = express();
var server = http.createServer(router);
var genId = require('gen-id')('nnnna');

/**
 * Verify the validity of an URL with a regular expression (found on Google :D)
 */
function urlIsValid(url) {
 return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( url );
}

// static files (html, css ...)
router.use(express.static(path.resolve(__dirname, 'client')));

// route on GET with a parameter 
router.get('/add/*', function(req, res){
  // setting json headers
  res.set({ 'Content-Type': 'application/json' });
  
  // verifying passed URL
  var givenURL = req.params[0];
  if (!urlIsValid(givenURL)) {
    res.json({ "error": "URL invalid" });
  }
  
  // creating the doc to insert with a generated id (thx to gen-id package :D)
  var longURL = {
    realUrl: givenURL,
    shortUrl: genId.generate()
  };
  
  // connexion to mongo
  mongo.connect(dbURI, function(err, db) {
    if (err) throw err
    // inserting the new URL (TODO : verify if this URL already exists before insert it again)
    db.collection('urlshortener').insert(longURL, function(err, doc){
        if(err) throw err;
        // giving the response
        res.json({
         original_url: givenURL,
         short_url: process.env.APP_URL+'/p/'+ longURL.shortUrl
        });
        db.close();
    })
  })
});

// listening to an ID (TODO : look why the findOne does not work -__-)
router.get('/p/:id', function(req, res){
  // connection to mongo
  mongo.connect(dbURI, function(err, db) {
    if (err) throw err
    // we wanna find the URL which has the given shortURL
    db.collection('urlshortener').find({shortUrl: req.params.id}).toArray(function(err, docs){
      if(err) throw err;
      if(docs.length == 0) res.send(JSON.stringify({error: 'No URL was found for this ID'}))
      else {
        // we redirect
        var myDoc = docs[0];
        res.redirect(myDoc.realUrl);  
      }
    })
  })
});

// listening to port and processing
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("URL Shortener microservice listening at", addr.address + ":" + addr.port);
});
