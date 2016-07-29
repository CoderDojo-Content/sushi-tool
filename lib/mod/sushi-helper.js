(function() {
  var SushiCard, SushiSet, async, fs, glob, jsonfile, path, wizard;

  fs = require('fs');

  path = require('path');

  jsonfile = require('jsonfile');

  glob = require('glob');

  wizard = require('./sushi-wizards.js');

  async = require('async');

  SushiSet = (function() {
    var CARDS, DIFFICULTY, LANGUAGE, SET_TITLE;

    SET_TITLE = "serie_title";

    LANGUAGE = "language";

    DIFFICULTY = "difficulty";

    CARDS = "cards";

    function SushiSet(json_object) {
      var jsoncard;
      this.cards = [];
      if (json_object != null ? json_object.hasOwnProperty(SET_TITLE) : void 0) {
        this.serie_title = json_object[SET_TITLE];
      }
      if (json_object != null ? json_object.hasOwnProperty(LANGUAGE) : void 0) {
        this.language = json_object[LANGUAGE];
      }
      if (json_object != null ? json_object.hasOwnProperty(DIFFICULTY) : void 0) {
        this.difficulty = json_object[DIFFICULTY];
      }
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

    SushiSet.prototype.createMarkdownData = function() {
      var datajson, i, len, ref, sushi;
      datajson = {};
      ref = this.cards;
      for (i = 0, len = ref.length; i < len; i++) {
        sushi = ref[i];
        datajson[sushi.filename] = {
          title: sushi.title,
          filename: sushi.filename,
          language: this.language,
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
    var CARDNUMBER, FILENAME, LEVEL, TITLE;

    TITLE = "title";

    FILENAME = "filename";

    CARDNUMBER = "card_number";

    LEVEL = "level";

    function SushiCard(json_object) {
      this.level = 1;
      if (json_object != null ? json_object.hasOwnProperty(TITLE) : void 0) {
        this.title = json_object[TITLE];
      }
      if (json_object != null ? json_object.hasOwnProperty(FILENAME) : void 0) {
        this.filename = json_object[FILENAME];
      }
      if (json_object != null ? json_object.hasOwnProperty(CARDNUMBER) : void 0) {
        this.card_number = json_object[CARDNUMBER];
      }
      if (json_object != null ? json_object.hasOwnProperty(LEVEL) : void 0) {
        this.level = json_object[LEVEL];
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
    getSushiSet: function() {
      if (this.confExists()) {
        return new SushiSet(jsonfile.readFileSync(path.resolve(global.cwd, "_sushi.json")));
      } else {
        return new SushiSet();
      }
    },
    SushiSet: SushiSet
  };

  module.exports.SushiSet = SushiSet;

}).call(this);
