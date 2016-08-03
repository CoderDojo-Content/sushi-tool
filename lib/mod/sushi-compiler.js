(function() {
  var Git, Multispinner, NodePDF, async, factor, fs, glob, home, livereload, nodePDFproperties, open, os, outputFolder, pHeight, pWidth, path, port, template_dir, template_pwd, webPrefix, webpages;

  fs = require("fs");

  path = require('path');

  NodePDF = require("nodepdf");

  Multispinner = require("multispinner");

  async = require("async");

  open = require("open");

  Git = require("nodegit");

  glob = require("glob");

  os = require("os");

  livereload = require('livereload');

  port = 9080;

  webPrefix = "http://localhost:" + port + "/";

  outputFolder = "output-sushi/";

  factor = 0.33;

  pWidth = 2480 * factor;

  pHeight = 3508 * factor;

  webpages = [];

  nodePDFproperties = {
    viewportSize: {
      width: pWidth,
      height: pHeight
    },
    paperSize: {
      format: 'A4',
      width: pWidth,
      height: pHeight,
      orientation: 'portrait',
      margin: {
        top: '0px',
        left: '0px',
        right: '0px',
        bottom: '0px'
      }
    },
    zoomFactor: 1
  };

  home = process.env.HOME || process.env.USERPROFILE;

  template_dir = ".sushi-tool/template";

  template_pwd = path.resolve(path.join(home, template_dir));

  module.exports = {
    merge: false,
    live: function(sushiSet, openBrowser, liveCallback) {
      var app, express, harp, working_dir;
      express = require("express");
      harp = require("harp");
      app = express();
      working_dir = global.cwd;
      return async.series([
        function(callback) {
          var spinner;
          if (!fs.existsSync(template_pwd)) {
            console.log("Template folder does not exist %s", template_pwd);
            spinner = new Multispinner({
              'git_download': __("pdf.download_template")
            });
            return Git.Clone("https://github.com/diegogd/sushi-gen-template", template_pwd).then(function(repository) {
              spinner.success('git_download');
              return callback();
            });
          } else {
            return callback();
          }
        }, function(callback) {
          var target_file;
          target_file = path.join(template_pwd, "sushi");
          if (fs.existsSync(target_file)) {
            fs.unlinkSync(target_file);
          }
          fs.symlinkSync(working_dir, target_file);
          app.use(express["static"](template_pwd));
          app.use(harp.mount("/", template_pwd));
          return app.listen(port, function() {
            var firstCard, server;
            if (openBrowser) {
              server = livereload.createServer({
                exts: ['md']
              });
              server.watch(working_dir);
              firstCard = sushiSet.cards[0];
              open(webPrefix + "sushi/" + firstCard.filename);
            }
            return callback();
          });
        }, function(callback) {
          liveCallback();
          return callback();
        }
      ]);
    },
    renderPdf: function(sushiSet, output) {
      return this.live(sushiSet, false, (function(_this) {
        return function() {
          var filesSpiner, outputpdffiles, spinner;
          console.log("Rendering files...");
          if (_this.merge) {
            console.log(os.tmpdir());
            outputFolder = path.join(os.tmpdir(), "sushi-render");
          } else {
            outputFolder = output;
          }
          filesSpiner = {};
          outputpdffiles = [];
          sushiSet.cards.forEach(function(card) {
            var id, outputfile;
            id = card.filename;
            outputfile = path.join(outputFolder, id + ".pdf");
            outputpdffiles.push(outputfile);
            return filesSpiner[id] = id + ".md => " + outputfile;
          });
          spinner = new Multispinner(filesSpiner);
          spinner.on('done', function() {
            return async.series([
              function(callback) {
                var pdfconcat;
                if (_this.merge) {
                  console.log("Merging files");
                  pdfconcat = require('pdfconcat');
                  return pdfconcat(outputpdffiles, output, function(error) {
                    if (error) {
                      console.log("%s".red, error);
                    }
                    console.log("Files merged");
                    return callback();
                  });
                } else {
                  return callback();
                }
              }, function(callback) {
                if (_this.merge) {
                  return async.each(outputpdffiles, function(file, deletecallback) {
                    return fs.unlink(file, deletecallback);
                  }, function(err) {
                    return callback();
                  });
                }
              }, function(callback) {
                console.log("Closing web server...");
                return process.exit();
              }
            ]);
          });
          return async.eachLimit(sushiSet.cards, 5, function(card, callback) {
            var id, outputfile, pdf, url;
            id = card.filename;
            url = webPrefix + "sushi/" + id;
            outputfile = path.join(outputFolder, id + ".pdf");
            pdf = new NodePDF(url, outputfile, nodePDFproperties);
            return pdf.on("done", (function(_this) {
              return function() {
                spinner.success(id);
                return callback();
              };
            })(this));
          });
        };
      })(this));
    }
  };

}).call(this);
