inquirer = require 'inquirer'
sprintf = require('sprintf-js').sprintf

module.exports =
  newSushi: (callback) ->
    questions = [
          type: 'input'
          name: 'moduleName'
          message: __('newSushi.series_title')
          validate: (value) ->
            pass = value.match(/^[a-z0-9A-Z]+$/i)
            if pass
              return true
            else
              return 'Please enter a description'
        ,
          type: 'list'
          name: 'difficulty'
          message: 'Difficulty of the sushi card'
          choices: ['beginner', 'intermediate', 'advanced']
        ,
          type: 'rawlist'
          name: 'language'
          message: 'What language are you going teach?'
          choices: ['php', 'nodejs', 'dd']

      ]
    inquirer.prompt questions
    .then callback

  askForMissingInSushiCard: (sushiCard, callback) ->
    questions = [
        type: 'input'
        name: 'title'
        message: __('newSushi.cards.title')
        when: -> !sushiCard.title?
      ,
        type: 'input'
        name: 'filename'
        message: __('newSushi.cards.filename')
        when: -> !sushiCard.filename?
        default: ->
          return sprintf("%02d", sushiCard.card_number)
    ]
    inquirer.prompt questions
    .then (answers)->
      sushiCard.title = answers.title ? sushiCard.title
      sushiCard.filename = answers.filename ? sushiCard.filename
      callback()


  confirmDataOverwrite: (callback) ->
    inquirer.prompt
      type: 'confirm'
      name: 'overwrite'
      message: __('data.overwrite')
      default: false
    .then callback
