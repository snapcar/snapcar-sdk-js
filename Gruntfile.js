module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var configFileCreationNeeded = function() {
    return !grunt.file.exists('test/config.js')
  };

  grunt.initConfig({
    clean: ['dist'],

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['src/SnapCar.js'],
        dest: 'dist/SnapCar.js',
      },
    },  

    uglify: {
      my_target: {
        files: {
          'dist/SnapCar.min.js': ['dist/SnapCar.js']
        }
      }
    },

    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: 'dist/',
          themedir: 'node_modules/yuidoc-lucid-theme',
          helpers: ["node_modules/yuidoc-lucid-theme/helpers/helpers.js"],
          outdir: 'docs'
        }
      }
    },

    mocha: {
      test: {
        src: ['test/**/*.html'],
        options: {
          run: true,
        },
      },
    },

    'gh-pages': {
      options: {
        base: 'docs'
      },
      src: "**"
    },

    prompt: {
      target: {
        options: {
          questions: [
            {
              config: 'tests.baseDomain',
              type: 'input',
              message: 'Please type in the base URL of the web service on which to perform tests.',
              default: 'https://apisandbox.snapcar.com/public',
              when: configFileCreationNeeded,
            },
            {
              config: 'tests.token',
              type: 'input',
              message: 'Please type in the token that will be used for testing.',
              when: configFileCreationNeeded,
            }            
          ]
        }
      },
    }  

  });

  grunt.registerTask('create-config', 'Creates test config file.', function(a, b) {
    if (grunt.config('tests')) {
      grunt.file.write('test/config.js', 'config = ' + JSON.stringify(grunt.config('tests'), null, 2));
      grunt.log.writeln('Created test/config.js file with base domain and token parameters.');      
    }
  });

  grunt.registerTask('test', ['prompt', 'create-config', 'mocha']);
  grunt.registerTask('default', ['sync', 'clean', 'concat', 'uglify', 'test']);
  grunt.registerTask('doc', ['default', 'yuidoc']);
  grunt.registerTask('deploy-doc', ['doc', 'gh-pages']);

};