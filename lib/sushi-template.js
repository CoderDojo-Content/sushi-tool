#!/usr/bin/env node --harmony
(function() {
  require(__dirname + "/conf/localization.js");

  require(__dirname + "/conf/commander.js");

  module.exports = function() {
    return console.log("My firsth node command --");
  };

}).call(this);
