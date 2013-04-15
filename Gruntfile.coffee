module.exports = (grunt) ->

    # Project configuration.
    grunt.initConfig({
         pkg: grunt.file.readJSON 'package.json'
         qunit:
             files: ['test/*.html']
         coffee:
             options:
                 bare: true
             frontend:
                 files:
                    'dist/js/cashfiddle_fe.js': ['frontend.coffee']
             tests:
                files:
                    'test/all.js': ['cashfiddle.coffee'] 
                    'test/flow.js': ['test/flow.coffee']
             models:
                files:
                    'dist/js/cashfiddle.js': ['cashfiddle.coffee']       
         concat:
            test:
                files:
                    'test/vendor.js': ['vendor/dist/*.js']
            dist:
                files:
                    'dist/js/vendor.js': ['vendor/dist/*.js']
         watch:
            coffee:
                files: ['**/*.coffee']
                tasks: ['coffee']
    })
    
    grunt.registerTask 'default', ['coffee:models','coffee:frontend','concat:dist', 'qunit']
    grunt.registerTask 'test', ['coffee:tests', 'concat:test', 'qunit']
    grunt.registerTask 'vendor', ['concat:dist']
    grunt.registerTask 'fe', ['coffee:frontend']

    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-qunit'
    grunt.loadNpmTasks 'grunt-contrib-concat'
    grunt.loadNpmTasks 'grunt-contrib-watch'
