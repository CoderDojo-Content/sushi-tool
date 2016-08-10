(function() {
  var express;

  express = require("express");

  module.exports = function(sushiSet) {
    var router;
    router = express.Router();
    router.get('/', function(req, res) {
      return res.send('im the home page!');
    });
    router.get('/about', function(req, res) {
      return res.send('im the about page!');
    });
    router.get('/cards', function(req, res) {
      return res.json(sushiSet.cards);
    });
    return router;
  };

}).call(this);
