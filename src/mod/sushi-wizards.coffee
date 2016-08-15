inquirer = require 'inquirer'
sprintf = require('sprintf-js').sprintf

module.exports =
  askDataInSushiSet: (sushiSet, askOnlyIfMissing, callback) ->
    questions = [
          type: 'input'
          name: 'series_title'
          message: __('newSushi.series_title')
          when: -> !askOnlyIfMissing || !sushiSet.series_title?
          default: ->
            sushiSet.series_title
        ,
          type: 'input'
          name: 'description'
          message: __('newSushi.description')
          when: -> !askOnlyIfMissing || !sushiSet.description?
          default: ->
            sushiSet.description
        ,
          type: 'input'
          name: 'subject'
          message: __('newSushi.subject')
          when: -> !askOnlyIfMissing || !sushiSet.subject?
          default: ->
            sushiSet.subject ? 'python'
        ,
          type: 'list'
          name: 'difficulty'
          message: __('newSushi.difficulty')
          when: -> !askOnlyIfMissing || !sushiSet.difficulty?
          choices: [
            {name: __('sushi.difficulty.beginner'), value: 1}
            {name: __('sushi.difficulty.intermediate'), value: 2}
            {name: __('sushi.difficulty.advanced'), value: 3}
          ]
          default: ->
            sushiSet.difficulty - 1
        ,
          type: 'input'
          name: 'author'
          when: -> !askOnlyIfMissing || !sushiSet.author?
          message: __('newSushi.author')
          default: ->
            sushiSet.author
        ,
          type: 'input'
          name: 'website'
          when: -> !askOnlyIfMissing || !sushiSet.website?
          message: __('newSushi.website')
          default: ->
            sushiSet.website
        ,
          type: 'input'
          name: 'twitter'
          when: -> !askOnlyIfMissing || !sushiSet.twitter?
          message: __('newSushi.twitter')
          default: ->
            sushiSet.twitter
      ]

    inquirer.prompt questions
    .then (answers)->
      sushiSet.series_title = answers.series_title ? sushiSet.series_title
      sushiSet.description = answers.description ? sushiSet.description
      sushiSet.subject = answers.subject ? sushiSet.subject
      sushiSet.difficulty = answers.difficulty ? sushiSet.difficulty
      sushiSet.author = answers.author ? sushiSet.author
      sushiSet.website = answers.website ? sushiSet.website
      sushiSet.twitter = answers.twitter ? sushiSet.twitter

      callback()


  newSushi: (callback) ->
    questions = [
          type: 'input'
          name: 'series_title'
          message: __('newSushi.series_title')
        ,
          type: 'input'
          name: 'description'
          message: __('newSushi.description')
        ,
          type: 'input'
          name: 'subject'
          message: __('newSushi.subject')
          default: ->
            'python'
        ,
          type: 'list'
          name: 'difficulty'
          message: __('newSushi.difficulty')
          choices: [
            {name: __('sushi.difficulty.beginner'), value: 1}
            {name: __('sushi.difficulty.intermediate'), value: 2}
            {name: __('sushi.difficulty.advanced'), value: 3}
          ]
        ,
          type: 'input'
          name: 'author'
          message: __('newSushi.author')
        ,
          type: 'input'
          name: 'website'
          message: __('newSushi.website')
        ,
          type: 'input'
          name: 'twitter'
          message: __('newSushi.twitter')
        ,
          type: 'input'
          name: 'n_cards'
          message: __('newSushi.n_cards')
          validate: (value) ->
            pass = value.match(/^\d+$/i)
            if pass
              return true
            else
              return 'Please enter a valid number'
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

  confirmLoadConfigurationFromDataJson: (callback) ->
    inquirer.prompt
      type: 'confirm'
      name: 'generate'
      message: __('data.loadConfiguration')
      default: true
    .then callback

  confirmDataOverwrite: (callback) ->
    inquirer.prompt
      type: 'confirm'
      name: 'overwrite'
      message: __('data.overwrite')
      default: false
    .then callback
