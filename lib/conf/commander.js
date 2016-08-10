(function() {
  var SushiCompiler, SushiHelper, SushiWizard, async, checkRequiredFilesToExecute, color, commandExists, fs, livereload, loadToolbar, openbroser, path, pjson, program;

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

  checkRequiredFilesToExecute = function() {
    if (!SushiHelper.confExists()) {
      if (SushiHelper.mkdConfExists()) {
        console.log(__("messages.no_config_data_exec_scan"));
      } else {
        console.log(__("messages.no_config_exec_init"));
      }
      return process.exit(-1);
    }
  };

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
        return SushiHelper.askToLoadFromDataJson(function() {
          return process.exit(-1);
        });
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
      checkRequiredFilesToExecute();
      sushiSet = SushiHelper.getSushiSet();
      return SushiWizard.askDataInSushiSet(sushiSet, false, function() {
        sushiSet.saveAll();
        return sushiSet.updateFromLocalFiles();
      });
    };
  })(this));

  livereload = true;

  openbroser = true;

  loadToolbar = true;

  program.command("live").alias("l").description(__('commands.live')).option("--nolivereload", __('commands.liveoption.nolivereload'), function() {
    return livereload = false;
  }).option("--noopenbrowser", __('commands.liveoption.nobrowser'), function() {
    return openbroser = false;
  }).option("--notoolbar", __('commands.liveoption.notoolbar'), function() {
    return loadToolbar = false;
  }).action((function(_this) {
    return function() {
      var sushiSet;
      checkRequiredFilesToExecute();
      sushiSet = SushiHelper.getSushiSet();
      return SushiCompiler.live(sushiSet, loadToolbar, openbroser, livereload, function() {
        return console.log("Running");
      });
    };
  })(this));

  program.command("pdf <output>").alias("p").description(__('commands.pdf')).option("-m", __('commands.merge'), function(directory) {
    return SushiCompiler.merge = true;
  }).action((function(_this) {
    return function(outputFolder) {
      var sushiSet;
      checkRequiredFilesToExecute();
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
