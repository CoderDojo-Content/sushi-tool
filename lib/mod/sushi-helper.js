(function() {
  var SushiCard, SushiSet, async, fs, glob, jsonfile, path, wizard;

  fs = require('fs');

  path = require('path');

  jsonfile = require('jsonfile');

  glob = require('glob');

  wizard = require('./sushi-wizards.js');

  async = require('async');

  SushiSet = (function() {
    var AUTHOR, CARDS, DESCRIPTION, DIFFICULTY, LANGUAGE, SET_TITLE, SUBJECT, TWITTER, WEBSITE;

    SET_TITLE = "serie_title";

    DESCRIPTION = "description";

    SUBJECT = "subject";

    LANGUAGE = "language";

    DIFFICULTY = "difficulty";

    CARDS = "cards";

    AUTHOR = "author";

    WEBSITE = "website";

    TWITTER = "twitter";

    function SushiSet(json_object) {
      var jsoncard;
      if (json_object != null ? json_object.hasOwnProperty(SET_TITLE) : void 0) {
        this.serie_title = json_object[SET_TITLE];
      }
      this.language = /([a-z]*)/.exec(process.env.LANG)[0];
      if (json_object != null ? json_object.hasOwnProperty(LANGUAGE) : void 0) {
        this.language = json_object[LANGUAGE];
      }
      if (json_object != null ? json_object.hasOwnProperty(SUBJECT) : void 0) {
        this.subject = json_object[SUBJECT];
      }
      if (json_object != null ? json_object.hasOwnProperty(DESCRIPTION) : void 0) {
        this.description = json_object[DESCRIPTION];
      }
      if (json_object != null ? json_object.hasOwnProperty(AUTHOR) : void 0) {
        this.author = json_object[AUTHOR];
      }
      if (json_object != null ? json_object.hasOwnProperty(WEBSITE) : void 0) {
        this.website = json_object[WEBSITE];
      }
      if (json_object != null ? json_object.hasOwnProperty(TWITTER) : void 0) {
        this.twitter = json_object[TWITTER];
      }
      if (json_object != null ? json_object.hasOwnProperty(DIFFICULTY) : void 0) {
        this.difficulty = json_object[DIFFICULTY];
      }
      this.cards = [];
      if (json_object != null ? json_object.hasOwnProperty(CARDS) : void 0) {
        this.cards = (function() {
          var i, len, ref, results;
          ref = json_object[CARDS];
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            jsoncard = ref[i];
            results.push(new SushiCard(jsoncard));
          }
          return results;
        })();
      }
    }

    SushiSet.prototype.saveAll = function() {
      this.saveSushiJson();
      return this.createMarkdownDataFile();
    };

    SushiSet.prototype.saveSushiJson = function() {
      var file;
      file = path.resolve(global.cwd, "_sushi.json");
      return jsonfile.writeFile(file, this, {
        spaces: 2
      }, function(err) {
        if (err) {
          return console.log(err);
        }
      });
    };

    SushiSet.prototype.createMarkdownDataFile = function() {
      var data, file;
      data = this.createMarkdownData();
      file = path.resolve(global.cwd, "_data.json");
      return jsonfile.writeFile(file, data, {
        spaces: 2
      }, function(err) {
        if (err) {
          return console.log(err);
        }
      });
    };

    SushiSet.prototype.loadFromMarkdownData = function(callback) {
      var card, configuration, file, js_sushicard, key;
      file = path.resolve(global.cwd, "_data.json");
      configuration = jsonfile.readFileSync(file);
      for (key in configuration) {
        js_sushicard = configuration[key];
        this.serie_title = js_sushicard.series_title;
        this.subject = js_sushicard.language;
        card = new SushiCard();
        card.title = js_sushicard.title;
        card.filename = js_sushicard.filename;
        card.card_number = js_sushicard.card_number;
        this.cards.push(card);
      }
      return callback();
    };

    SushiSet.prototype.createMarkdownData = function() {
      var datajson, i, len, ref, sushi;
      datajson = {};
      ref = this.cards;
      for (i = 0, len = ref.length; i < len; i++) {
        sushi = ref[i];
        datajson[sushi.filename] = {
          title: sushi.title,
          filename: sushi.filename,
          language: this.subject,
          subject: this.subject,
          level: sushi.level,
          card_number: sushi.card_number,
          series_total_cards: this.cards.length,
          series_title: this.serie_title
        };
      }
      return datajson;
    };

    SushiSet.prototype.addNewCardWizard = function(callback) {
      var card;
      card = new SushiCard();
      card.card_number = this.cards.length + 1;
      return card.fillMissingWithWizard((function(_this) {
        return function() {
          var cardfile;
          _this.cards.push(card);
          _this.saveAll();
          fs.writeFile;
          cardfile = path.resolve(global.cwd, card.filename + ".md");
          return fs.writeFile(cardfile, "1. \n", function(err) {
            if (err) {
              console.log(err);
            }
            return callback();
          });
        };
      })(this));
    };

    SushiSet.prototype.addNewCardWizardWithFilenameAndNumber = function(filename, number, callback) {
      var card;
      card = new SushiCard();
      card.filename = filename;
      card.card_number = number;
      card.fillMissingWithWizard(callback);
      return this.cards.push(card);
    };

    SushiSet.prototype.updateFromLocalFiles = function() {
      var dir;
      dir = path.resolve(global.cwd);
      return glob(dir + "/*.md", (function(_this) {
        return function(err, files) {
          var file, filenames, missing;
          filenames = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = files.length; i < len; i++) {
              file = files[i];
              results.push(path.basename(file, '.md'));
            }
            return results;
          })();
          missing = filenames.filter(function(file) {
            return !_this.cards.some(function(item) {
              return file === item.filename;
            });
          });
          return async.eachSeries(missing, function(card, callback) {
            console.log("File ".bold + (card + ".md").green + " found - please complete the info");
            return _this.addNewCardWizardWithFilenameAndNumber(card, _this.cards.length + 1, callback);
          }, function() {
            _this.saveSushiJson();
            _this.createMarkdownDataFile();
            return console.log("Configuration updated!".red);
          });
        };
      })(this));
    };

    return SushiSet;

  })();

  SushiCard = (function() {
    var CARDNUMBER, FILENAME, TITLE;

    TITLE = "title";

    FILENAME = "filename";

    CARDNUMBER = "card_number";

    function SushiCard(json_object) {
      if (json_object != null ? json_object.hasOwnProperty(TITLE) : void 0) {
        this.title = json_object[TITLE];
      }
      if (json_object != null ? json_object.hasOwnProperty(FILENAME) : void 0) {
        this.filename = json_object[FILENAME];
      }
      if (json_object != null ? json_object.hasOwnProperty(CARDNUMBER) : void 0) {
        this.card_number = json_object[CARDNUMBER];
      }
    }

    SushiCard.prototype.setTitle = function(title) {
      this.title = title;
    };

    SushiCard.prototype.getTitle = function() {
      return this.title;
    };

    SushiCard.prototype.fillMissingWithWizard = function(callback) {
      return wizard.askForMissingInSushiCard(this, callback);
    };

    return SushiCard;

  })();

  module.exports = {
    confExists: function() {
      return fs.existsSync(path.resolve(global.cwd, "_sushi.json"));
    },
    mkdConfExists: function() {
      return fs.existsSync(path.resolve(global.cwd, "_data.json"));
    },
    initSushiSetWithWizard: function() {
      if (this.confExists()) {
        return console.log("There is already an existing project, please use " + "sync".red + " to syncronize your project");
      } else {
        return wizard.newSushi(function(data) {
          var i, n_cards, ref, ref1, ref2, ref3, results, sushi;
          sushi = new SushiSet();
          sushi.serie_title = data.serie_title;
          sushi.description = data.description;
          sushi.subject = data.subject;
          sushi.difficulty = (ref = data.difficulty) != null ? ref : data.difficulty;
          sushi.author = (ref1 = data.author) != null ? ref1 : data.author;
          sushi.website = (ref2 = data.website) != null ? ref2 : data.website;
          sushi.twitter = (ref3 = data.twitter) != null ? ref3 : data.twitter;
          n_cards = parseInt(data.n_cards);
          return async.eachSeries((function() {
            results = [];
            for (var i = 0; 0 <= n_cards ? i <= n_cards : i >= n_cards; 0 <= n_cards ? i++ : i--){ results.push(i); }
            return results;
          }).apply(this), function(item, callback) {
            return sushi.addNewCardWizard(callback);
          });
        });
      }
    },
    getSushiSet: function() {
      if (this.confExists()) {
        return new SushiSet(jsonfile.readFileSync(path.resolve(global.cwd, "_sushi.json")));
      } else {
        return new SushiSet();
      }
    },
    askToLoadFromDataJson: function() {
      return wizard.confirmLoadConfigurationFromDataJson(function(answer) {
        var sushiset;
        if (answer.generate) {
          sushiset = new SushiSet();
          return sushiset.loadFromMarkdownData(function() {
            return sushiset.saveAll();
          });
        }
      });
    },
    SushiSet: SushiSet
  };

  module.exports.SushiSet = SushiSet;

}).call(this);
