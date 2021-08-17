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
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task
    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['uglify']);

};
