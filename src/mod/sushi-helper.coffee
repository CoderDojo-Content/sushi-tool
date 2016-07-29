fs = require 'fs'
path = require 'path'
jsonfile = require 'jsonfile'
glob = require 'glob'
wizard = require './sushi-wizards.js'
async = require 'async'

class SushiSet
  SET_TITLE = "serie_title"
  LANGUAGE = "language"
  DIFFICULTY = "difficulty"
  CARDS = "cards"

  constructor: (json_object) ->
    @cards = []
    if json_object?.hasOwnProperty(SET_TITLE)
      @serie_title = json_object[SET_TITLE]
    if json_object?.hasOwnProperty(LANGUAGE)
      @language = json_object[LANGUAGE]
    if json_object?.hasOwnProperty(DIFFICULTY)
      @difficulty = json_object[DIFFICULTY]
    if json_object?.hasOwnProperty(CARDS)
      @cards = for jsoncard in json_object[CARDS]
        new SushiCard(jsoncard)

  saveAll: ->
    @saveSushiJson()
    @createMarkdownDataFile()

  saveSushiJson: ->
    file = path.resolve(global.cwd, "_sushi.json")
    jsonfile.writeFile file, @, {spaces: 2}, (err) ->
      if err
        return console.log(err)

  createMarkdownDataFile: ->
    data = @createMarkdownData()
    file = path.resolve(global.cwd, "_data.json")
    jsonfile.writeFile file, data, {spaces: 2}, (err) ->
      if err
        return console.log(err)

  createMarkdownData: ->
    datajson = {}
    for sushi in @cards
      datajson[sushi.filename] =
        title: sushi.title
        filename: sushi.filename
        language: @language
        level: sushi.level
        card_number: sushi.card_number
        series_total_cards: @cards.length
        series_title: @serie_title
    datajson
  addNewCardWizard: (callback) ->
    card = new SushiCard()
    card.card_number = (@cards.length+1)
    card.fillMissingWithWizard =>
      @cards.push card
      @saveAll()
      fs.writeFile
      cardfile = path.resolve(global.cwd, "#{card.filename}.md")
      fs.writeFile cardfile, "1. \n", (err) ->
          if(err)
            console.log(err)
          callback()

  addNewCardWizardWithFilenameAndNumber: (filename, number, callback) ->
    card = new SushiCard()
    card.filename = filename
    card.card_number = number
    card.fillMissingWithWizard(callback)
    @cards.push card

  updateFromLocalFiles: ->
    dir = path.resolve global.cwd
    glob "#{dir}/*.md", (err, files) =>
      filenames = for file in files
        path.basename file, '.md'

      missing = filenames.filter (file) =>
        !@cards.some (item) =>
          file == item.filename

      async.eachSeries missing, (card, callback) =>
        console.log "File ".bold + "#{card}.md".green + " found - please complete the info"
        @addNewCardWizardWithFilenameAndNumber(card, (@cards.length+1), callback)
      , () =>
        @saveSushiJson()
        @createMarkdownDataFile()
        console.log "Configuration updated!".red

class SushiCard
  TITLE = "title"
  FILENAME = "filename"
  CARDNUMBER = "card_number"
  LEVEL = "level"
  constructor: (json_object) ->
    @level = 1
    if json_object?.hasOwnProperty(TITLE)
      @title = json_object[TITLE]
    if json_object?.hasOwnProperty(FILENAME)
      @filename = json_object[FILENAME]
    if json_object?.hasOwnProperty(CARDNUMBER)
      @card_number = json_object[CARDNUMBER]
    if json_object?.hasOwnProperty(LEVEL)
      @level = json_object[LEVEL]
  setTitle: (@title) ->
  getTitle: -> @title
  fillMissingWithWizard: (callback) ->
    wizard.askForMissingInSushiCard @, callback

module.exports =
  confExists: ->
    fs.existsSync(path.resolve(global.cwd, "_sushi.json"))
  mkdConfExists: ->
    fs.existsSync(path.resolve(global.cwd, "_data.json"))
  getSushiSet: ->
    if @confExists()
      new SushiSet(jsonfile.readFileSync(path.resolve(global.cwd, "_sushi.json")))
    else
      new SushiSet()


  SushiSet: SushiSet


module.exports.SushiSet = SushiSet
