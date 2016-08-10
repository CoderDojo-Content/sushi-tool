fs    = require "fs"
path  = require 'path'
NodePDF       = require "nodepdf"
Multispinner  = require "multispinner"
async = require "async"
open  = require "open"
glob  = require "glob"
os    = require "os"
livereload    = require('livereload');
port  = 9080
webPrefix     = "http://localhost:#{port}/"

factor    = 0.33
pWidth    = 2480 * factor
pHeight   = 3508 * factor
webpages  = []
SushiTemplateLoader = require "./sushi-template-loader.js"

nodePDFproperties =
  viewportSize:
      width: pWidth
      height: pHeight
  paperSize:
      format: 'A4'
      width: pWidth
      height: pHeight
      orientation: 'portrait'
      margin:
        top: '0px'
        left: '0px'
        right: '0px'
        bottom: '0px'
  zoomFactor: 1

module.exports =
  merge: false
  live: (sushiSet, loadToolbar, openBrowser, loadLiveReload, liveCallback) ->
    express = require("express")
    harp = require("harp")
    app = express()
    working_dir = global.cwd
    webtool_dir = path.join(__dirname, "../../webtool/")

    async.series [
      (callback) ->
        SushiTemplateLoader.prepareTemplateFolder ->
          callback()
      ,
      (callback) ->
        template_pwd = SushiTemplateLoader.template_pwd
        target_file = path.join template_pwd, "sushi"

        if (fs.existsSync(target_file))
          fs.unlinkSync(target_file)
        fs.symlinkSync(working_dir, target_file)

        app.use(express.static(template_pwd))

        if loadToolbar
          # Polymer toolbar
          app.use("/webtool/", express.static(webtool_dir))
          app.use("/sushi-services/", require("./sushi-webtool-service.js")(sushiSet))
          app.use(require('connect-inject')
            runAll: true
            rules: [
                match: /<\/head>/ig
                snippet: """
                <script src="/webtool/bower_components/webcomponentsjs/webcomponents-lite.js"></script>
                <link rel="import" href="/webtool/chopsticks-toolbar.html">
                """
                fn: (w, s) -> s + w
              ,
                match: /<body>/ig
                snippet: [
                  '<chopsticks-toolbar></chopsticks-toolbar>'
                ]
                fn: (w, s) -> w + s
            ]
          )

        app.use(harp.mount("/",template_pwd))

        app.listen port, ->
          if loadLiveReload
            server = livereload.createServer({exts: ['md']})
            server.watch(working_dir)

          if openBrowser
            firstCard = sushiSet.cards[0]
            open(webPrefix + "sushi/" + firstCard.filename )

          callback()
      ,
      (callback) ->
        liveCallback()
        callback()
    ]

  renderPdf: (sushiSet, output) ->
    loadToolbar = false
    openBrowser = false
    loadLiveReload = false
    @live sushiSet, loadToolbar, openBrowser, loadLiveReload, =>

      if @merge
        outputFolder = path.join os.tmpdir(), "sushi-render"
      else
        outputFolder = output

      filesSpiner = {}
      outputpdffiles = []

      sushiSet.cards.forEach (card) =>
        id = card.filename
        outputfile = path.join outputFolder, "#{id}.pdf"
        outputpdffiles.push outputfile
        filesSpiner[id] = "#{id}.md => #{outputfile}"

      spinner = new Multispinner filesSpiner

      spinner.on 'done', =>
        async.series [
          (callback) =>
            if @merge
              pdfconcat = require 'pdfconcat'
              pdfconcat outputpdffiles, output, (error) ->
                if error
                  console.log "%s".red, error
                callback()
            else
              callback()
          , (callback) =>
            if @merge
              async.each outputpdffiles, (file, deletecallback) ->
                fs.unlink file, deletecallback
              , (err) =>
                callback()
            else
              callback()
          , (callback) =>
            process.exit()
          ]

      async.eachLimit sushiSet.cards, 5, (card, callback) ->
        id = card.filename
        url = webPrefix + "sushi/" + id
        outputfile = path.join outputFolder, "#{id}.pdf"

        pdf = new NodePDF url,
        outputfile, nodePDFproperties

        pdf.on "done", =>
          spinner.success(id)
          callback()
