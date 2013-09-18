module.exports = function (grunt) {

    // Project configuration
    grunt.initConfig({
        uglify: {
            build: {
                files: {
                    'sprdapp.min.js': ['sprdapp.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');


    // Default task
    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['uglify:build']);

};