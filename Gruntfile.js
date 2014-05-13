// Gruntfile

module.exports = function(grunt) {
  'use strict'
  require('load-grunt-tasks')(grunt);

  var baseJsSourcePath = 'src/js/',
      fileToBuild = 'dist/js/' + 'pro.js';

  grunt.initConfig({
    concat: {
      dist: {
        src: '<%= customBuild.files %>',
        dest: fileToBuild
      }
    },
    wrap: {
      modules: {
        src: [fileToBuild],
        options: {
          wrapper: [';(function (pro) {\n' +
            '\twindow.Pro = pro();\n' +
            '}(function() {', '\treturn Pro;\n}));'],
          indent: '\t',
          separator: '\n'
        }
      }
    },
    uglify: {
      main: {
        files: {
          'dist/js/pro.min.js': ['dist/js/pro.js']
        }
      }
    },
    clean: {
      dist: ['tmp', 'dist']
    },

    jshint: {
      dev: {
        files: [
          [
          ]
        ],
        options: {
          curly: true,
          multistr: true,
          quotmark: 'single',
          camelcase: true,
          bitwise: false,
          unused: true,
          eqeqeq: true,
          indent: 2,
          immed: true,
          latedef: true,
          newcap: true,
          noarg: true,
          sub: true,
          boss: true,
          es5: true,
          eqnull: true,
          evil: true,
          scripturl: true,
          smarttabs: true,
          maxparams: 5,
          maxdepth: 3,
          maxlen: 100,
          globals: {}
        }
      },
    },

    jsdoc : {
      dist : {
        src: ['src/js/**/*.js'],
        options: {
          destination: 'doc'
        }
      }
    },

    todo: {
      options: {
        verbose: true,
        marks: [
          {
            name: 'TODO',
            pattern: /TODO|\@todo/,
            color: "magenta"
          }
        ]
      },
      src : [
        'spec/unit/flow/flow.spec.js',
        'src/js/arrays/pro_array.js',
        'src/js/properties/property.js',
      ]
    },

    karma: {
      unit: {
        configFile: 'spec/config/karma.conf.js',
        keepalive: true
      },
      integration: {
        configFile: 'spec/config/karma.integration.conf.js',
        keepalive: true
      }
    }
  });

  grunt.registerTask('setup', 'build task', function() {

    var defaultFiles = [
          'pro',
          'flow/queue',
          'flow/queues',
          'flow/flow',
          'arrays/pro_array',
          'properties/property',
          'properties/auto_property',
          'properties/object_property',
          'properties/array_property',
          'objects/pro_val',
          'objects/prob',
        ],
        args = this.args, customFiles = [], index, i = -1;

    if (args.length) {
      while (++i < args.length) {
        index = defaultFiles.indexOf(args[i]);
        if (index !== -1) {
          defaultFiles.splice(index, 1);
        }
      }
    }

    customFiles = defaultFiles.map(function(currentFile) {
      return baseJsSourcePath + currentFile + '.js';
    });

    grunt.config.set('customBuild.files', customFiles);
  });

  grunt.registerTask('build', ['clean:dist', 'setup', 'concat', 'wrap', 'uglify', 'karma:integration']);
  grunt.registerTask('spec', ['karma:unit']);
  grunt.registerTask('all', ['lint', 'todo', 'spec', 'jsdoc', 'build']);

  grunt.registerTask('default', ['build']);

};
