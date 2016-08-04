(function() {
  var SushiCompiler, SushiHelper, SushiWizard, async, color, commandExists, fs, path, pjson, program;

  program = require("commander");

  commandExists = require("command-exists");

  async = require("async");

  SushiHelper = require(__dirname + '/../mod/sushi-helper.js');

  SushiWizard = require(__dirname + '/../mod/sushi-wizards.js');

  SushiCompiler = require(__dirname + '/../mod/sushi-compiler.js');

  fs = require('fs');

  path = require('path');

  color = require('colors');

  pjson = require(__dirname + '/../../package.json');

  global.cwd = process.cwd();

  program.version(pjson.version).option("-C, --chdir <path>", __('commands.chdir'), function(directory) {
    global.cwd = path.resolve(directory);
    return console.log(__("messages.current_directory"), path.resolve(directory));
  });

  program.command("scan").description(__('commands.scan')).action((function(_this) {
    return function() {
      var check_files, checks, file, i, index, isDataFile, isSushiConf, len;
      console.log("Checking file system");
      check_files = ["_data.json", "_sushi.json"];
      checks = [];
      isDataFile = SushiHelper.mkdConfExists();
      isSushiConf = SushiHelper.confExists();
      checks[0] = isDataFile ? "X".green : "-".red;
      checks[1] = isSushiConf ? "X".green : "-".red;
      for (index = i = 0, len = check_files.length; i < len; index = ++i) {
        file = check_files[index];
        console.log("[%s] %s", checks[index], file);
      }
      if (isDataFile && !isSushiConf) {
        console.log(__("messages.no_config"), "_data.json".red);
        return SushiHelper.askToLoadFromDataJson();
      }
    };
  })(this));

  program.command("init").description(__('commands.init')).action((function(_this) {
    return function() {
      var sushiSet;
      return sushiSet = SushiHelper.initSushiSetWithWizard();
    };
  })(this));

  program.command("new").alias("n").description(__('commands.new')).action((function(_this) {
    return function() {
      var sushiSet;
      sushiSet = SushiHelper.getSushiSet();
      return sushiSet.addNewCardWizard(function() {
        return console.log("Sushi card added");
      });
    };
  })(this));

  program.command("sync").alias("s").description(__('commands.sync')).action((function(_this) {
    return function() {
      var sushiSet;
      sushiSet = SushiHelper.getSushiSet();
      return SushiWizard.askDataInSushiSet(sushiSet, true, function() {
        sushiSet.saveAll();
        return sushiSet.updateFromLocalFiles();
      });
    };
  })(this));

  program.command("edit").alias("e").description(__('commands.edit')).action((function(_this) {
    return function() {
      var sushiSet;
      sushiSet = SushiHelper.getSushiSet();
      return SushiWizard.askDataInSushiSet(sushiSet, false, function() {
        sushiSet.saveAll();
        return sushiSet.updateFromLocalFiles();
      });
    };
  })(this));

  program.command("live").alias("l").description(__('commands.live')).action((function(_this) {
    return function() {
      var sushiSet;
      sushiSet = SushiHelper.getSushiSet();
      return SushiCompiler.live(sushiSet, true, function() {
        return console.log("Running");
      });
    };
  })(this));

  program.command("pdf <output>").alias("p").description(__('commands.pdf')).option("-m", __('commands.merge'), function(directory) {
    return SushiCompiler.merge = true;
  }).action((function(_this) {
    return function(outputFolder) {
      var sushiSet;
      sushiSet = SushiHelper.getSushiSet();
      return commandExists('phantomjs', function(err, exists) {
        if (!exists) {
          return console.log(__('pdf.render_tool'), "phantomjs".red);
        } else {
          return async.series([
            function(callback) {
              if (SushiCompiler.merge) {
                return commandExists('pdfunite', function(err, exists) {
                  if (!exists) {
                    console.log(__('pdf.merge_tool'), "merge (-m)".bold, "pdfunite".red);
                    return process.exit(-1);
                  } else {
                    return callback();
                  }
                });
              } else {
                return callback();
              }
            }, function(callback) {
              return SushiCompiler.renderPdf(sushiSet, outputFolder);
            }
          ]);
        }
      });
    };
  })(this));

  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.help();
  }

}).call(this);
