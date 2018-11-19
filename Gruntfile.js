module.exports = function(grunt) {
    'use strict';

    var vendors = {
        'jquery': 'bower_components/jquery/dist/jquery.min.js',
        'modenizer': 'src/js/vendor/modernizr.custom.35977.min.js',
        'jquery.event.move': 'src/js/vendor/jquery/jquery.event.move.js',
        'jquery.event.swipe': 'src/js/vendor/jquery/jquery.event.swipe.js',
        'jquery.transit': 'src/js/vendor/jquery/jquery.transit.js'
    };

    grunt.initConfig({
        // Store your Package file so you can reference its specific data whenever necessary
        pkg: grunt.file.readJSON('package.json'),

        copy: {

        },

        sass: {
            dev: {
                options: {
                    style: 'nested',
                    loadPath: [
                        'bower_components/normalize-scss'
                    ],
                },
                files: {
                    "dist/css/styles.css": "src/scss/all.scss"
                }
           },
           prod: {
               options: {
                   style: 'compressed',
                   sourcemap: 'none'
               },
               files: {
                 "dist/css/styles.css": "src/scss/all.scss"
                }
           }
        },

        // Run: `grunt watch` from command line for this section to take effect
        watch: {
            scss: {
                files: 'src/scss/**/*.scss',
                tasks: 'default'
            },
            livereload: {
                options: {
                  livereload: true
                },
                files: [
                  'dist/css/styles.css'
                ]
              }
        },

        browserSync: {
          dev: {
              bsFiles: {
                  src : [
                      'src/scss/**/*.scss',
                      'dist/css/*.css',
                      'src/js/**/*.js',
                      'dist/js/**/*.js'
                  ]
              },
              options: {
                  server: {
                      baseDir: "./"
                  }
              }
          }
      }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browser-sync');

    // Default Task
    grunt.registerTask('default', ['sass:dev']);

    // Watch task
    grunt.registerTask('watch', ["browserSync", "watch"]);
};
