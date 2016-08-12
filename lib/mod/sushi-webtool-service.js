(function() {
  var express;

  express = require("express");

  module.exports = function(sushiSet) {
    var router;
    router = express.Router();
    router.get('/series', function(req, res) {
      return res.json({
        series_title: sushiSet.series_title,
        description: sushiSet.description,
        subject: sushiSet.subject,
        author: sushiSet.author,
        website: sushiSet.website,
        twitter: sushiSet.twitter
      });
    });
    router.post('/series', function(req, res) {
      sushiSet.series_title = req.body.series_title || sushiSet.series_title;
      sushiSet.description = req.body.description || sushiSet.description;
      sushiSet.subject = req.body.subject || sushiSet.subject;
      sushiSet.author = req.body.author || sushiSet.author;
      sushiSet.website = req.body.website || sushiSet.website;
      sushiSet.twitter = req.body.twitter || sushiSet.twitter;
      sushiSet.saveAll();
      return res.json({
        result: "ok"
      });
    });
    router.get('/cards', function(req, res) {
      return res.json(sushiSet.cards);
    });
    router.post('/cards', function(req, res) {
      var cards;
      cards = req.body;
      sushiSet.cards = cards;
      sushiSet.saveAll();
      return res.json({
        result: "ok"
      });
    });
    return router;
  };

}).call(this);
