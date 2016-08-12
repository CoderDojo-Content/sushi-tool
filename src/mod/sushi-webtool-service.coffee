express = require "express"

module.exports = (sushiSet) ->
  router = express.Router()

  router.get '/series', (req, res) ->
    res.json
      series_title: sushiSet.series_title
      description: sushiSet.description
      subject: sushiSet.subject
      author: sushiSet.author
      website: sushiSet.website
      twitter: sushiSet.twitter

  router.post '/series', (req, res) ->
    sushiSet.series_title = req.body.series_title || sushiSet.series_title
    sushiSet.description = req.body.description || sushiSet.description
    sushiSet.subject = req.body.subject || sushiSet.subject
    sushiSet.author = req.body.author || sushiSet.author
    sushiSet.website = req.body.website || sushiSet.website
    sushiSet.twitter = req.body.twitter || sushiSet.twitter
    sushiSet.saveAll()

    res.json
      result: "ok"

  router.get '/cards', (req, res) ->
    res.json sushiSet.cards

  router.post '/cards', (req, res) ->
    cards = req.body
    sushiSet.cards = cards
    sushiSet.saveAll()
    res.json
      result: "ok"

  return router
