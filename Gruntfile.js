/**
 * Created by XRene on 2015/10/17.
 */
module.exports = function (grunt) {
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        less: {
            build: {
                expand: true,
                cwd: 'less/',
                src: ['*.less'],
                dest: 'app/stylesheets/',
                ext: '.css'
            }
        },

        watch: {
            files: ['less/**/*.less'],
            tasks: ['default']
        }
    });

    grunt.registerTask('default', ['less']);
}