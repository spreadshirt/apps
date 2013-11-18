module.exports = function (grunt) {

    // Project configuration
    grunt.initConfig({
        uglify: {
            build: {
                options: {
                    banner: "/*\nMIT License\nCopyright (c) 2013 Tony Findeisen\nhttps://github.com/spreadshirt/sprdApp/blob/master/LICENSE\n*/\n"
                },
                files: {
                    'spreadshirt.min.js': ['spreadshirt.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');


    // Default task
    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['uglify:build']);

};