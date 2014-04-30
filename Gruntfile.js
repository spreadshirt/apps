module.exports = function (grunt) {

    // Project configuration
    grunt.initConfig({
        uglify: {
            build: {
                options: {
                    preserveComments: "some"
                },
                files: {
                    'spreadshirt.min.js': ['spreadshirt.js']
                }
            }
        },

        sass: {
            dist: {
                files: {
                    "css/style.css": "scss/app.scss"
                }
            }
        },

        autoprefixer: {
            options: {
                browsers: ['last 2 version', 'ie 8', 'ie 9'],
                expand: true,
                flatten: true
            },
            css: {
                src: "css/style.css",
                dest: "css/style.css"
            }
        },

        cssmin: {
            combine: {
                files: {
                    'css/style.css': ['css/style.css']
                }
            }
        },

        watch: {
            sass: {
                files: ["**/*.scss"],
                task: ["sass"],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');


    // Default task
    grunt.registerTask('default', ['sass', 'watch']);
    grunt.registerTask('build', ['build-before', 'build-after']);

    // before jekyll runs
    grunt.registerTask('build-before', ['uglify']);

    // after jekyll has run
    grunt.registerTask('build-after', ['sass', 'autoprefixer', 'cssmin']);


};