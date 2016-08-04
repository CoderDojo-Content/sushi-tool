(function() {
  var Git, Multispinner, async, bower, downloadDependencies, fs, gitRepository, home, os, path, prettyjson, tempalte_git_dir, template_dir, template_git_pwd, template_pwd;

  async = require("async");

  bower = require("bower");

  fs = require("fs");

  Git = require("nodegit");

  os = require("os");

  path = require("path");

  home = os.homedir();

  Multispinner = require("multispinner");

  tempalte_git_dir = ".sushi-tool/template-git";

  template_git_pwd = path.resolve(path.join(home, tempalte_git_dir));

  template_dir = ".sushi-tool/template";

  template_pwd = path.resolve(path.join(home, template_dir));

  prettyjson = require('prettyjson');

  gitRepository = "https://github.com/PhilipHarney/sushi-gen";

  downloadDependencies = function(callback) {
    var config;
    config = {
      cwd: template_git_pwd
    };
    return bower.commands.install([], {}, config).on("end", function() {
      return callback();
    });
  };

  module.exports = {
    template_pwd: template_pwd,
    isTemplateReady: function() {
      return fs.existsSync(template_git_pwd);
    },
    updateTemplate: function(callback) {
      var spinner;
      spinner = new Multispinner({
        'bower_dependencies': __("pdf.bower_dependencies")
      });
      downloadDependencies(function() {
        if (!fs.existsSync(template_pwd)) {
          fs.symlinkSync(path.join(template_git_pwd, "public"), template_pwd);
        }
        if (!fs.existsSync(path.join(template_pwd, "_harp.json"))) {
          fs.symlinkSync(path.join(template_git_pwd, "harp.json"), path.join(template_pwd, "_harp.json"));
        }
        return spinner.success('bower_dependencies');
      });
      return spinner.on('done', (function(_this) {
        return function() {
          return callback();
        };
      })(this));
    },
    downloadTemplate: function(callback) {
      return Git.Clone(gitRepository, template_git_pwd, {
        checkoutBranch: "master"
      }).then(function(repository) {
        return callback();
      });
    },
    prepareTemplateFolder: function(externalCallback) {
      return async.series([
        (function(_this) {
          return function(callback) {
            var spinner;
            if (!_this.isTemplateReady()) {
              spinner = new Multispinner({
                'git_download': __("pdf.download_template")
              });
              return _this.downloadTemplate(function() {
                spinner.success('git_download');
                return callback();
              });
            } else {
              return callback();
            }
          };
        })(this), (function(_this) {
          return function(callback) {
            return _this.updateTemplate(function() {
              return callback();
            });
          };
        })(this), (function(_this) {
          return function(callback) {
            externalCallback();
            return callback();
          };
        })(this)
      ]);
    }
  };

}).call(this);
