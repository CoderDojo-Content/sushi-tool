(function() {
  var SushiHelper, SushiWizard, color, fs, path, pjson, program;

  program = require("commander");

  SushiHelper = require(__dirname + '/../mod/sushi-helper.js');

  SushiWizard = require(__dirname + '/../mod/sushi-wizards.js');

  fs = require('fs');

  path = require('path');

  color = require('colors');

  pjson = require(__dirname + '/../../package.json');

  global.cwd = process.cwd();

  program.version(pjson.version).option("-C, --chdir <path>", "Change the working directory", function(directory) {
    global.cwd = path.resolve(directory);
    return console.log("Current working directory is %s", path.resolve(directory));
  });

  program.command("scan").description("Check if there are existing files in the directory").action((function(_this) {
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
        console.log("There is not configuration, but there is a " + "_data.json".red);
        return SushiHelper.askToLoadFromDataJson();
      }
    };
  })(this));

  program.command("init").description("Prepare current folder to generate a sushiCard").action((function(_this) {
    return function() {
      var sushiSet;
      return sushiSet = SushiHelper.initSushiSetWithWizard();
    };
  })(this));

  program.command("new").alias("n").description("Add a new Sushi card in this set").action((function(_this) {
    return function() {
      var sushiSet;
      sushiSet = SushiHelper.getSushiSet();
      return sushiSet.addNewCardWizard(function() {
        return console.log("Sushi card added");
      });
    };
  })(this));

  program.command("sync").alias("s").description("Update SushiCard configuration from existing markdown files").action((function(_this) {
    return function() {
      var sushiSet;
      sushiSet = SushiHelper.getSushiSet();
      return SushiWizard.askDataInSushiSet(sushiSet, true, function() {
        sushiSet.saveAll();
        return sushiSet.updateFromLocalFiles();
      });
    };
  })(this));

  program.command("edit").alias("e").description("Edit current sushiSet card").action((function(_this) {
    return function() {
      var sushiSet;
      sushiSet = SushiHelper.getSushiSet();
      return SushiWizard.askDataInSushiSet(sushiSet, false, function() {
        sushiSet.saveAll();
        return sushiSet.updateFromLocalFiles();
      });
    };
  })(this));

  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.help();
  }

}).call(this);
