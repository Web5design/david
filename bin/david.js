#!/usr/bin/env node

var david = require('../');
var fs = require('fs');
var util = require('util');
var npm = require('npm');
var cwd = process.cwd();
var packageFile = cwd + '/package.json';

var blue  = '\033[34m';
var reset = '\033[0m';
var green = '\033[32m';
var gray = '\033[90m';
var yellow = '\033[33m';

var printDeps = function(deps, type) {
  if (Object.keys(deps).length === 0) {
    return;
  }
  if (type) {
    type += ' ';
  } else {
    type = '';
  }
  var oneline = ['npm install'];
  if (type == 'Dev ') {
    oneline.push('--save-dev');
  } else if (type == 'Global ') {
    oneline.push('--global');
  } else {
    oneline.push('--save');
  }

  console.log('');
  console.log('%sOutdated %sDependencies%s', yellow, type, reset);
  console.log('');

  for (var name in deps) {
    var dep = deps[name];
    oneline.push(name+'@'+dep.stable);
    console.log('%s%s%s %s(package:%s %s, %slatest: %s%s%s)%s', 
                green,
                name,
                reset,

                gray,
                blue,
                dep.required,

                gray,
                blue,
                dep.stable,
                gray,
                reset
               );
  }
  console.log('');
  console.log('%s%s%s', gray, oneline.join(' '), reset);
  console.log('');
};


var getDeps = function(pkg, global) {
  david.getUpdatedDependencies(pkg, { stable: true }, function(err, deps) {

    var primaryDeps = deps;

    david.getUpdatedDependencies(pkg, { dev: true, stable: true }, function(err, deps) {
      var devDeps = deps;


      printDeps(primaryDeps, (global) ? 'Global' : '');
      printDeps(devDeps, (global) ? 'Global' : 'Dev');

    });

  });
};

if (process.argv.indexOf('-g') > -1 || process.argv.indexOf('--global') > -1) {

  npm.load({ global: true }, function(err) {
    if (err) {
      throw err;
    }
    npm.commands.ls([], true, function(err, data) {
      if (err) {
        throw err;
      }
      var pkg = {
        name: 'Global Dependencies',
        dependencies: {}
      };
      for (var key in data.dependencies) {
        pkg.dependencies[key] = data.dependencies[key].version;
      }
      getDeps(pkg, true);
    });
  });

} else {
  if (!fs.existsSync(packageFile)) {
    console.log('package.json does not exist');
    return;
  }

  var pkg = require(cwd + '/package.json');
  getDeps(pkg);
}


