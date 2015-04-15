module.exports = function(grunt) {
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

  'gh-pages': {
    options: {
      base: 'docs'
    },
    src: "**"
  }

});

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('default', ['sync', 'clean', 'concat', 'uglify']);
  grunt.registerTask('docs', ['default', 'yuidoc']);
  grunt.registerTask('deploy-docs', ['docs', 'gh-pages']);

};