fs    = require "fs"
path  = require 'path'
NodePDF       = require "nodepdf"
Multispinner  = require "multispinner"
async = require "async"
open  = require "open"
Git   = require "nodegit"
glob  = require "glob"
os    = require "os"
livereload    = require('livereload');
port  = 9080
webPrefix     = "http://localhost:#{port}/"
outputFolder  = "output-sushi/"
factor    = 0.33
pWidth    = 2480 * factor
pHeight   = 3508 * factor
webpages  = []

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

home = process.env.HOME || process.env.USERPROFILE
template_dir = ".sushi-tool/template"
template_pwd = path.resolve(path.join(home, template_dir))

module.exports =
  merge: false
  live: (sushiSet, openBrowser, liveCallback) ->
    express = require("express")
    harp = require("harp")
    app = express()
    working_dir = global.cwd

    async.series [
      (callback) ->
        if (!fs.existsSync(template_pwd))
          console.log "Template folder does not exist %s", template_pwd
          spinner = new Multispinner
            'git_download': __("pdf.download_template")

          Git.Clone "https://github.com/diegogd/sushi-gen-template", template_pwd
          .then (repository) ->
            spinner.success('git_download')
            callback()
        else
          callback()
      ,
      (callback) ->
        target_file = path.join template_pwd, "sushi"
        if (fs.existsSync(target_file))
          fs.unlinkSync(target_file)

        fs.symlinkSync(working_dir, target_file)
        app.use(express.static(template_pwd))
        app.use(harp.mount("/",template_pwd))

        app.listen port, ->
          if openBrowser
            server = livereload.createServer({exts: ['md']})
            server.watch(working_dir)

            firstCard = sushiSet.cards[0]
            open(webPrefix + "sushi/" + firstCard.filename )
          callback()
      ,
      (callback) ->
        liveCallback()
        callback()
    ]

  renderPdf: (sushiSet, output) ->
    @live sushiSet, false, =>
      console.log "Rendering files..."

      if @merge
        console.log os.tmpdir()
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
              console.log "Merging files"
              pdfconcat = require 'pdfconcat'
              pdfconcat outputpdffiles, output, (error) ->
                if error
                  console.log "%s".red, error
                console.log "Files merged"
                callback()
            else
              callback()
          , (callback) =>
            if @merge
              async.each outputpdffiles, (file, deletecallback) ->
                fs.unlink file, deletecallback
              , (err) =>
                callback()
          , (callback) =>
            console.log "Closing web server..."
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
