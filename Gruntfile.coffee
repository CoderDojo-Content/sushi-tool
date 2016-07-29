module.exports =  ->

  @initConfig
    pkg: @file.readJSON 'package.json'
    usebanner:
      executionPrepend:
        options:
          position: 'top'
          banner: "#!/usr/bin/env node --harmony"
        files:
          src: [ 'lib/sushi-tool.js' ]
    coffee:
      compile:
        files:
          'lib/sushi-tool.js': 'src/sushi-tool.coffee'
      glob_to_multiple:
        expand: true
        flatten: false
        cwd: 'src/'
        src: ['**/*.coffee']
        dest: 'lib/'
        ext: '.js'
    watch:
      coffee:
        files: 'src/**/*.coffee'
        tasks: ['build']

  @loadNpmTasks 'grunt-banner'
  @loadNpmTasks 'grunt-contrib-coffee'
  @loadNpmTasks 'grunt-contrib-watch'
  @registerTask 'build', ['coffee', 'usebanner']
  @registerTask 'default', ['coffee']
