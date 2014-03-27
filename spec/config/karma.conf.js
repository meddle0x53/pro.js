module.exports = function(karma) {
  karma.set({
    basePath: '../..',
    frameworks: ['jasmine'],

    files: [
      'src/js/properties/*.js',
      'src/js/start.js',
      'spec/spec_helper.js',
      'spec/**/*.spec.js'
    ],

    browsers: ['PhantomJS', 'Firefox'],
    captureTimeout: 5000,
    singleRun: true,
    reportSlowerThan: 500,

    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher'
    ]
  });
};
