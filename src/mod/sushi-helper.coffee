fs = require 'fs'
path = require 'path'
jsonfile = require 'jsonfile'
glob = require 'glob'
wizard = require './sushi-wizards.js'
async = require 'async'

class SushiSet
  SET_TITLE = "serie_title"
  DESCRIPTION = "description"
  SUBJECT = "subject"
  LANGUAGE = "language"
  DIFFICULTY = "difficulty"
  CARDS = "cards"
  AUTHOR = "author"
  WEBSITE = "website"
  TWITTER = "twitter"

  constructor: (json_object) ->
    if json_object?.hasOwnProperty(SET_TITLE)
      @serie_title = json_object[SET_TITLE]

    @language = /([a-z]*)/.exec(process.env.LANG)[0]
    if json_object?.hasOwnProperty(LANGUAGE)
      @language = json_object[LANGUAGE]
    if json_object?.hasOwnProperty(SUBJECT)
      @subject = json_object[SUBJECT]
    if json_object?.hasOwnProperty(DESCRIPTION)
      @description = json_object[DESCRIPTION]
    if json_object?.hasOwnProperty(AUTHOR)
      @author = json_object[AUTHOR]
    if json_object?.hasOwnProperty(WEBSITE)
      @website = json_object[WEBSITE]
    if json_object?.hasOwnProperty(TWITTER)
      @twitter = json_object[TWITTER]
    if json_object?.hasOwnProperty(DIFFICULTY)
      @difficulty = json_object[DIFFICULTY]

    @cards = []
    if json_object?.hasOwnProperty(CARDS)
      loadingCards = for jsoncard in json_object[CARDS]
        new SushiCard(jsoncard)
      async.each loadingCards, (card, callback) =>
        if fs.existsSync(path.resolve(global.cwd, card.filename + ".md"))
          @cards.push (card)

    @cards = @cards.sort (a, b) ->
      a.card_number - b.card_number

  saveAll: ->
    @saveSushiJson()
    @createMarkdownDataFile()

  saveSushiJson: ->
    file = path.resolve(global.cwd, "_sushi.json")
    jsonfile.writeFile file, @, {spaces: 2}, (err) ->
      if err
        console.log(err)

  createMarkdownDataFile: ->
    data = @createMarkdownData()
    file = path.resolve(global.cwd, "_data.json")
    jsonfile.writeFile file, data, {spaces: 2}, (err) ->
      if err
        console.log(err)

  loadFromMarkdownData: (callback) ->
    file = path.resolve(global.cwd, "_data.json")
    configuration = jsonfile.readFileSync(file)

    for key of configuration
      js_sushicard = configuration[key]
      @serie_title = js_sushicard.series_title
      @subject = js_sushicard.language

      card = new SushiCard()
      card.title = js_sushicard.title
      card.filename = js_sushicard.filename
      card.card_number = js_sushicard.card_number

      @cards.push card

    callback()

  createMarkdownData: ->
    datajson = {}
    for sushi in @cards
      datajson[sushi.filename] =
        title: sushi.title
        filename: sushi.filename
        language: @subject
        subject: @subject
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
        console.log __("messages.conf_updated").red

class SushiCard
  TITLE = "title"
  FILENAME = "filename"
  CARDNUMBER = "card_number"
  constructor: (json_object) ->
    if json_object?.hasOwnProperty(TITLE)
      @title = json_object[TITLE]
    if json_object?.hasOwnProperty(FILENAME)
      @filename = json_object[FILENAME]
    if json_object?.hasOwnProperty(CARDNUMBER)
      @card_number = json_object[CARDNUMBER]
  setTitle: (@title) ->
  getTitle: -> @title
  fillMissingWithWizard: (callback) ->
    wizard.askForMissingInSushiCard @, callback

module.exports =
  confExists: ->
    fs.existsSync(path.resolve(global.cwd, "_sushi.json"))
  mkdConfExists: ->
    fs.existsSync(path.resolve(global.cwd, "_data.json"))
  initSushiSetWithWizard: ->
    if @confExists()
      console.log __("messages.dont_use_init"), "sync".red
    else
      wizard.newSushi (data) ->
        sushi = new SushiSet()
        sushi.serie_title = data.serie_title
        sushi.description = data.description
        sushi.subject = data.subject
        sushi.difficulty = data.difficulty ? data.difficulty
        sushi.author = data.author ? data.author
        sushi.website = data.website ? data.website
        sushi.twitter = data.twitter ? data.twitter

        n_cards = parseInt(data.n_cards)
        async.eachSeries [1..n_cards], (item, callback) ->
          sushi.addNewCardWizard (callback)

  getSushiSet: ->
    if @confExists()
      new SushiSet(jsonfile.readFileSync(path.resolve(global.cwd, "_sushi.json")))
    else
      new SushiSet()
  askToLoadFromDataJson: ->
    wizard.confirmLoadConfigurationFromDataJson (answer) ->
      if answer.generate
        sushiset = new SushiSet()
        sushiset.loadFromMarkdownData ->
          sushiset.saveAll()

  SushiSet: SushiSet


module.exports.SushiSet = SushiSet
