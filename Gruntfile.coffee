module.exports = (grunt) ->

    # Project configuration.
    grunt.initConfig(
        pkg: grunt.file.readJSON 'package.json'
        qunit:
             files: ['test/*.html']
        coffee:
            options:
                 bare: true
            all:
                 files:
                    'dist/js/cashfiddle.js': ['src/coffee/*.coffee']
            tests:
                files:
                    'test/all.js': ['src/coffee/cashfiddle.coffee'] 
                    'test/flow.js': ['test/flow.coffee']
        concat:
            test:
                files:
                    'test/vendor.js': ['vendor/dist/*.js']
            dist:
                files:
                    'dist/css/cashfiddle.css': ['src/css/*.css']
            vendor:
                files:
                    'dist/js/vendor.js': ['vendor/dist/*.js']
                    'dist/css/vendor.css': ['vendor/css/*.css']
        watch:
            coffee_all:
                files: ['src/coffee/*.coffee']
                tasks: ['coffee:all']
            coffee_test:
                files: ['test/*.coffee']
                tasks: ['coffee:tests']  
        copy:
            view:
                files: [
                    { expand:true, flatten: true, dest: 'dist/', src: 'src/html/*' }
                ]
            vendor:
                files: [
                    { expand:true, flatten: true, dest: 'dist/font/', src: 'vendor/font/*' }
                ]
    )
    
    grunt.registerTask 'dist', ['coffee:all','concat:dist','copy:view']
    grunt.registerTask 'dist_with_assets', ['coffee:all','concat:dist', 'copy']
    grunt.registerTask 'default', ['coffee:all','concat:dist', 'qunit']
    grunt.registerTask 'test', ['coffee:tests', 'concat:test', 'qunit']
    grunt.registerTask 'vendor', ['concat:vendor']

    grunt.loadNpmTasks 'grunt-contrib-copy'
    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-qunit'
    grunt.loadNpmTasks 'grunt-contrib-concat'
    grunt.loadNpmTasks 'grunt-contrib-watch'
