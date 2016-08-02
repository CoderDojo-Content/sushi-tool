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
  isDataFile = SushiHelper.mkdConfExists()
  isSushiConf = SushiHelper.confExists()

  checks[0] = if isDataFile then "X".green else "-".red
  checks[1] = if isSushiConf then "X".green else "-".red

  for file, index in check_files
    console.log "[%s] %s", checks[index], file

  if isDataFile && not isSushiConf
    console.log "There is not configuration, but there is a " + "_data.json".red
    SushiHelper.askToLoadFromDataJson()

program
.command "init"
.description "Prepare current folder to generate a sushiCard"
.action =>
  sushiSet = SushiHelper.initSushiSetWithWizard()

program
.command "new"
.alias "n"
.description "Add a new Sushi card in this set"
.action =>
  sushiSet = SushiHelper.getSushiSet()
  sushiSet.addNewCardWizard ->
    console.log "Sushi card added"

program
.command "sync"
.alias "s"
.description "Update SushiCard configuration from existing markdown files"
.action =>
  sushiSet = SushiHelper.getSushiSet()
  SushiWizard.askDataInSushiSet sushiSet, true, ->
    sushiSet.saveAll()
    sushiSet.updateFromLocalFiles()

program
.command "edit"
.alias "e"
.description "Edit current sushiSet card"
.action =>
  sushiSet = SushiHelper.getSushiSet()
  SushiWizard.askDataInSushiSet sushiSet, false, ->
    sushiSet.saveAll()
    sushiSet.updateFromLocalFiles()


program
.parse process.argv

if !process.argv.slice(2).length
  program.help()
