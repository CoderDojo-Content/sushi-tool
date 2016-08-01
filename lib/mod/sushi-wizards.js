(function() {
  var inquirer, sprintf;

  inquirer = require('inquirer');

  sprintf = require('sprintf-js').sprintf;

  module.exports = {
    newSushi: function(callback) {
      var questions;
      questions = [
        {
          type: 'input',
          name: 'moduleName',
          message: __('newSushi.series_title'),
          validate: function(value) {
            var pass;
            pass = value.match(/^[a-z0-9A-Z]+$/i);
            if (pass) {
              return true;
            } else {
              return 'Please enter a description';
            }
          }
        }, {
          type: 'list',
          name: 'difficulty',
          message: 'Difficulty of the sushi card',
          choices: ['beginner', 'intermediate', 'advanced']
        }, {
          type: 'rawlist',
          name: 'language',
          message: 'What language are you going teach?',
          choices: ['php', 'nodejs', 'dd']
        }
      ];
      return inquirer.prompt(questions).then(callback);
    },
    askForMissingInSushiCard: function(sushiCard, callback) {
      var questions;
      questions = [
        {
          type: 'input',
          name: 'title',
          message: __('newSushi.cards.title'),
          when: function() {
            return sushiCard.title == null;
          }
        }, {
          type: 'input',
          name: 'filename',
          message: __('newSushi.cards.filename'),
          when: function() {
            return sushiCard.filename == null;
          },
          "default": function() {
            return sprintf("%02d", sushiCard.card_number);
          }
        }
      ];
      return inquirer.prompt(questions).then(function(answers) {
        var ref, ref1;
        sushiCard.title = (ref = answers.title) != null ? ref : sushiCard.title;
        sushiCard.filename = (ref1 = answers.filename) != null ? ref1 : sushiCard.filename;
        return callback();
      });
    },
    confirmLoadConfigurationFromDataJson: function(callback) {
      return inquirer.prompt({
        type: 'confirm',
        name: 'generate',
        message: __('data.loadConfiguration'),
        "default": true
      }).then(callback);
    },
    confirmDataOverwrite: function(callback) {
      return inquirer.prompt({
        type: 'confirm',
        name: 'overwrite',
        message: __('data.overwrite'),
        "default": false
      }).then(callback);
    }
  };

}).call(this);
