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
        plugins: ['karma-phantomjs-launcher', 'karma-browserify', 'karma-chai', 'karma-growl-reporter', 'karma-mocha', 'karma-mocha-reporter'],
        reporters: ['growl', 'mocha'],
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

