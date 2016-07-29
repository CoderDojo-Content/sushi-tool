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
      var check_files, checks, file, i, index, len, results;
      console.log("Checking file system");
      check_files = ["_data.json", "_sushi.json"];
      checks = [];
      checks[0] = SushiHelper.mkdConfExists() ? "X".green : "-".red;
      checks[1] = SushiHelper.confExists() ? "X".green : "-".red;
      results = [];
      for (index = i = 0, len = check_files.length; i < len; index = ++i) {
        file = check_files[index];
        results.push(console.log("[%s] %s", checks[index], file));
      }
      return results;
    };
  })(this));

  program.command("init").description("Prepare current folder to generate a sushiCard").action((function(_this) {
    return function() {
      var sushiSet;
      sushiSet = SushiHelper.getSushiSet();
      return sushiSet.addNewCardWizard(function() {
        return console.log("Sushi card added");
      });
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

  program.command("info").alias("i").description("Display available information of the SushiCard set").action((function(_this) {
    return function() {
      var sushiSet;
      sushiSet = SushiHelper.getSushiSet();
      return console.log("Sushi : %j", sushiSet);
    };
  })(this));

  program.command("sync").alias("s").description("Update SushiCard configuration from existing markdown files").action((function(_this) {
    return function() {
      var sushiSet;
      sushiSet = SushiHelper.getSushiSet();
      return sushiSet.updateFromLocalFiles();
    };
  })(this));

  program.command("datajson").description("Create or regenerate _data.json file from _sushi.json").action((function(_this) {
    return function(dir) {
      var sushiSet;
      sushiSet = SushiHelper.getSushiSet();
      if (SushiHelper.mkdConfExists()) {
        console.log(__('data.exists').green);
        return SushiWizard.confirmDataOverwrite(function(response) {
          if (response.overwrite) {
            return sushiSet.createMarkdownDataFile();
          }
        });
      } else {
        return sushiSet.createMarkdownDataFile();
      }
    };
  })(this));

  program.command('*').action(function(env) {
    return console.log('deploying "%s"', env);
  });

  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.help();
  }

}).call(this);