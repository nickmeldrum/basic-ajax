module.exports = function (config) {
    'use strict';

    config.set({
        basePath: '',
        frameworks: ['browserify', 'mocha', 'chai'],
        files: [
            'lib/*.js',
            'test/*.js'
        ],
        preprocessors: {
            'lib/*.js': [ 'browserify' ],
            'test/*.js': [ 'browserify' ]
            },
        reporters: ['progress'],
        port: 9876,
        colors: true,
        autoWatch: true,
        singleRun: false,
        logLevel: config.LOG_INFO,
        browsers: ['PhantomJS'],
        browserify: {
          debug: true
        }
    });
};

