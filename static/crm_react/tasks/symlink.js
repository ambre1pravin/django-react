'use strict';


module.exports = function symlink(grunt) {
    // Load task
    grunt.loadNpmTasks('grunt-contrib-symlink');

    // Options
    return {
        explicit: {
            src: '../crm_react',
            dest: 'node_modules/crm_react'
        }
    };
};