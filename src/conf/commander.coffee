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
.option "-C, --chdir <path>", __('commands.chdir'), (directory) ->
  global.cwd = path.resolve(directory)
  console.log __("messages.current_directory"), path.resolve(directory)

program
.command "scan"
.description __('commands.scan')
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

    console.log __("messages.no_config"), "_data.json".red
    SushiHelper.askToLoadFromDataJson()

program
.command "init"
.description __('commands.init')
.action =>
  sushiSet = SushiHelper.initSushiSetWithWizard()

program
.command "new"
.alias "n"
.description __('commands.new')
.action =>
  sushiSet = SushiHelper.getSushiSet()
  sushiSet.addNewCardWizard ->
    console.log "Sushi card added"

program
.command "sync"
.alias "s"
.description __('commands.sync')
.action =>
  sushiSet = SushiHelper.getSushiSet()
  SushiWizard.askDataInSushiSet sushiSet, true, ->
    sushiSet.saveAll()
    sushiSet.updateFromLocalFiles()

program
.command "edit"
.alias "e"
.description __('commands.edit')
.action =>
  sushiSet = SushiHelper.getSushiSet()
  SushiWizard.askDataInSushiSet sushiSet, false, ->
    sushiSet.saveAll()
    sushiSet.updateFromLocalFiles()


program
.parse process.argv

if !process.argv.slice(2).length
  program.help()
