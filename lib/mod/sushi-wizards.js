(function() {
  var inquirer, sprintf;

  inquirer = require('inquirer');

  sprintf = require('sprintf-js').sprintf;

  module.exports = {
    askDataInSushiSet: function(sushiSet, askOnlyIfMissing, callback) {
      var questions;
      questions = [
        {
          type: 'input',
          name: 'serie_title',
          message: __('newSushi.series_title'),
          when: function() {
            return !askOnlyIfMissing || (sushiSet.serie_title == null);
          },
          "default": function() {
            return sushiSet.serie_title;
          }
        }, {
          type: 'input',
          name: 'description',
          message: __('newSushi.description'),
          when: function() {
            return !askOnlyIfMissing || (sushiSet.description == null);
          },
          "default": function() {
            return sushiSet.description;
          }
        }, {
          type: 'input',
          name: 'subject',
          message: __('newSushi.subject'),
          when: function() {
            return !askOnlyIfMissing || (sushiSet.subject == null);
          },
          "default": function() {
            var ref;
            return (ref = sushiSet.subject) != null ? ref : 'python';
          }
        }, {
          type: 'list',
          name: 'difficulty',
          message: __('newSushi.difficulty'),
          when: function() {
            return !askOnlyIfMissing || (sushiSet.difficulty == null);
          },
          choices: [
            {
              name: __('sushi.difficulty.beginner'),
              value: 1
            }, {
              name: __('sushi.difficulty.intermediate'),
              value: 2
            }, {
              name: __('sushi.difficulty.advanced'),
              value: 3
            }
          ],
          "default": function() {
            return sushiSet.difficulty - 1;
          }
        }, {
          type: 'input',
          name: 'author',
          when: function() {
            return !askOnlyIfMissing || (sushiSet.author == null);
          },
          message: __('newSushi.author'),
          "default": function() {
            return sushiSet.author;
          }
        }, {
          type: 'input',
          name: 'website',
          when: function() {
            return !askOnlyIfMissing || (sushiSet.website == null);
          },
          message: __('newSushi.website'),
          "default": function() {
            return sushiSet.website;
          }
        }, {
          type: 'input',
          name: 'twitter',
          when: function() {
            return !askOnlyIfMissing || (sushiSet.twitter == null);
          },
          message: __('newSushi.twitter'),
          "default": function() {
            return sushiSet.twitter;
          }
        }
      ];
      return inquirer.prompt(questions).then(function(answers) {
        var ref, ref1, ref2, ref3, ref4, ref5, ref6;
        sushiSet.serie_title = (ref = answers.serie_title) != null ? ref : sushiSet.serie_title;
        sushiSet.description = (ref1 = answers.description) != null ? ref1 : sushiSet.description;
        sushiSet.subject = (ref2 = answers.subject) != null ? ref2 : sushiSet.subject;
        sushiSet.difficulty = (ref3 = answers.difficulty) != null ? ref3 : sushiSet.difficulty;
        sushiSet.author = (ref4 = answers.author) != null ? ref4 : sushiSet.author;
        sushiSet.website = (ref5 = answers.website) != null ? ref5 : sushiSet.website;
        sushiSet.twitter = (ref6 = answers.twitter) != null ? ref6 : sushiSet.twitter;
        return callback();
      });
    },
    newSushi: function(callback) {
      var questions;
      questions = [
        {
          type: 'input',
          name: 'serie_title',
          message: __('newSushi.series_title')
        }, {
          type: 'input',
          name: 'description',
          message: __('newSushi.description')
        }, {
          type: 'input',
          name: 'subject',
          message: __('newSushi.subject'),
          "default": function() {
            return 'python';
          }
        }, {
          type: 'list',
          name: 'difficulty',
          message: __('newSushi.difficulty'),
          choices: [
            {
              name: __('sushi.difficulty.beginner'),
              value: 1
            }, {
              name: __('sushi.difficulty.intermediate'),
              value: 2
            }, {
              name: __('sushi.difficulty.advanced'),
              value: 3
            }
          ]
        }, {
          type: 'input',
          name: 'author',
          message: __('newSushi.author')
        }, {
          type: 'input',
          name: 'website',
          message: __('newSushi.website')
        }, {
          type: 'input',
          name: 'twitter',
          message: __('newSushi.twitter')
        }, {
          type: 'input',
          name: 'n_cards',
          message: __('newSushi.n_cards'),
          validate: function(value) {
            var pass;
            pass = value.match(/^\d+$/i);
            if (pass) {
              return true;
            } else {
              return 'Please enter a valid number';
            }
          }
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
