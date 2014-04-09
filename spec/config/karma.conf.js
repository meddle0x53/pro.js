module.exports = function(karma) {
  karma.set({
    basePath: '../..',
    frameworks: ['jasmine'],

    files: [
      'src/js/pro.js',
      'src/js/flow/queue.js',
      'src/js/flow/queues.js',
      'src/js/flow/flow.js',
      'src/js/properties/property.js',
      'src/js/properties/auto_property.js',
      'src/js/start.js',
      'spec/spec_helper.js',
      'spec/**/*.spec.js'
    ],

    browsers: ['PhantomJS'],
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
