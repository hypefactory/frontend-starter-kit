module.exports = function(grunt) {
    'use strict';

    var vendors = {
        'jquery': 'bower_components/jquery/dist/jquery.min.js',
        'modenizer': 'src/js/vendor/modernizr.custom.35977.min.js',
        'jquery.event.move': 'src/js/vendor/jquery/jquery.event.move.js',
        'jquery.event.swipe': 'src/js/vendor/jquery/jquery.event.swipe.js',
        'jquery.transit': 'src/js/vendor/jquery/jquery.transit.js',
        'anime': 'src/js/vendor/anime.js',
        'picturefill': 'src/js/vendor/picturefill.min.js'
    };

    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        // Store your Package file so you can reference its specific data whenever necessary
        pkg: grunt.file.readJSON('package.json'),

        browserSync: {
            bsFiles: {
                src : [
                    './*.html',
                    './dist/css/**/*.css',
                    './dist/js/**/*.js'
                ]
            },
            options: {
                watchTask: true,
                server: {
                    baseDir: "./"
                }
            }
        },

        concat: {
            js: {
                src: [
                    vendors.modenizer,
                    vendors.picturefill,
                    vendors.jquery,
                    vendors["jquery.event.move"],
                    vendors["jquery.event.swipe"],
                    vendors["jquery.transit"],
                    vendors.anime,

                    'src/js/jquery.plugin-base.js',
                    'src/js/jquery.statemanager.js',
                    'src/js/jquery.storagemanager.js',

                    'src/js/plugins/**/*.js',

                    'src/js/jquery.starter-kit.js',
                ],
                dest: 'dist/js/app.js'
            }
        },

        uglify: {
            dist: {
                files:{
                    'dist/js/app.min.js': ['dist/js/app.js']
                },
            }
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
            options: {
                livereload: true,
            },
            scss: {
                files: 'src/scss/**/*.scss',
                tasks: 'sass:dev'
            },
            scripts: {
                files: 'src/js/**/*.js',
                tasks: ['concat', 'uglify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default Task
    grunt.registerTask('default', ['sass:dev', 'browserSync', 'watch']);

    // Watch task
    // grunt.registerTask('watch', ['concat', 'uglify', 'watch']);
};
