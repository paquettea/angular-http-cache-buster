module.exports = function (config) {
    config.set({

        basePath: './',

        files: [
            'bower_components/angular/angular.js',
            'src//**/module.js',
            'src/**/config*.js',
            'src/**/*.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'test/**/*.mock.js',
            'test/**/*.spec.js'
        ],
        autoWatch: true,

        frameworks: ['jasmine'],

        reporters: ['spec'],
        browsers: ['PhantomJS'],
        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-spec-reporter'
        ]

    });
};
