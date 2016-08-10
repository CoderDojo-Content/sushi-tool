express = require "express"

module.exports = (sushiSet) ->
  router = express.Router()

  router.get '/', (req, res) ->
      res.send('im the home page!')

  router.get '/about', (req, res) ->
      res.send('im the about page!')

  router.get '/cards', (req, res) ->
    res.json sushiSet.cards

  return router
