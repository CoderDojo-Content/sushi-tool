program = require "commander"
SushiHelper = require __dirname + '/../mod/sushi-helper.js'
SushiWizard = require __dirname + '/../mod/sushi-wizards.js'

fs = require('fs')
path = require('path')
color = require('colors')

pjson = require(__dirname + '/../../package.json');
global.cwd = process.cwd()



program
.version(pjson.version)
.option "-C, --chdir <path>", "Change the working directory", (directory) ->
  global.cwd = path.resolve(directory)
  console.log "Current working directory is %s", path.resolve(directory)

program
.command "scan"
.description "Check if there are existing files in the directory"
.action =>
  console.log "Checking file system"
  check_files = [
    "_data.json"
    "_sushi.json"
  ]
  checks = []
  checks[0] = if SushiHelper.mkdConfExists() then "X".green else "-".red
  checks[1] = if SushiHelper.confExists() then "X".green else "-".red

  for file, index in check_files
    console.log "[%s] %s", checks[index], file

program
.command "init"
.description "Prepare current folder to generate a sushiCard"
.action =>
  sushiSet = SushiHelper.getSushiSet()
  sushiSet.addNewCardWizard ->
    console.log "Sushi card added"

program
.command "new"
.alias "n"
.description "Add a new Sushi card in this set"
.action =>
  sushiSet = SushiHelper.getSushiSet()
  sushiSet.addNewCardWizard ->
    console.log "Sushi card added"

program
.command "info"
.alias "i"
.description "Display available information of the SushiCard set"
.action =>
  sushiSet = SushiHelper.getSushiSet()
  console.log "Sushi : %j", sushiSet

program
.command "sync"
.alias "s"
.description "Update SushiCard configuration from existing markdown files"
.action =>
  sushiSet = SushiHelper.getSushiSet()
  sushiSet.updateFromLocalFiles()

program
.command "datajson"
.description "Create or regenerate _data.json file from _sushi.json"
.action (dir) =>
  sushiSet = SushiHelper.getSushiSet()

  if SushiHelper.mkdConfExists()
    console.log __('data.exists').green
    SushiWizard.confirmDataOverwrite (response) ->
      if (response.overwrite)
        sushiSet.createMarkdownDataFile()
  else
    sushiSet.createMarkdownDataFile()

program
.command('*')
.action (env) ->
    console.log('deploying "%s"', env)

program
.parse process.argv

if !process.argv.slice(2).length
  program.help()
