#!/usr/bin/env node

// go to project root, then run
// node build-scripts/bower2git.js src/platform/component-game/
// to replace component-game with git-checkouted folder
// when finished, run bower install in src to overwrite git checkouted folder with bower-installed

var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var del = require('del');
var exec = require('child_process').exec;
var program = require('commander');

var pathValue;
var indent = '  ';

program
    .version(require('./package.json').version)
    .arguments('<path>')
    .option('-v, --verbose', '')
    .action(function (path) {
        pathValue = path;
    })
    .parse(process.argv);

if (!program.args.length) {
    program.help();
}

// [0] will be "node"
// [1] will be the reference to the script
// [2] will be path to bower directory
var folderPath = program.args[0];


if (!folderPath) {
    console.error(chalk.red(indent + 'ABORTING: No path provided!'));
    process.exit(1);
}

// find platform folder
if (!fs.existsSync(folderPath)) {
    console.error(chalk.red(indent + 'ABORTING: Folder "' + folderPath + '"" does not exist'));
    process.exit(1);
}

// find bower json
var bowerPath = path.join(folderPath, 'bower.json');

// find folder name
var dirName = path.dirname(folderPath);
var folderName = path.basename(folderPath);

if (!fs.existsSync(bowerPath)) {
    console.error(chalk.red(indent + 'ABORTING: No bower.json found in ' + folderPath));
    process.exit(1);
}

fs.readFile(bowerPath, function (err, data) {
    'use strict';
    if (err) {
        throw err;
    }

    var json = JSON.parse(data);
    var url;
    var tmpFolderName = path.join(dirName, 'tmp' + Date.now());

    if (program.verbose) {
        console.log(indent + 'Found bower component: ' + json.name);
    }

    if (!json.repository || !json.repository.url || !json.repository.type) {
        console.error(chalk.red(indent +  'ABORTING: No repository information found in bower.json'));
        process.exit(1);
    }

    if (json.repository.type !== 'git') {
        console.error(chalk.red(indent + 'ABORTING: Not a git repository'));
        process.exit(1);
    }

    console.log(indent + 'Replacing bower component with git repository...');

    url = json.repository.url;

    if (program.verbose) {
        console.log(indent + 'Cloning from ' + url + ' to temporary directory...');
    }

    exec('git clone ' + url + ' ' + tmpFolderName, function (err) {
        if (err) {
            throw err;
        }

        if (program.verbose) {
            console.log(chalk.green(indent + indent + 'Done!'));
        }

        if (program.verbose) {
            console.log(indent + 'Deleting bower component folder...');
        }

        // TODO: rename old folder before removing to be able to fallback
        // 1. rename old folder to tmp
        // 2. rename new folder to component name
        // 3. delete old folder

        del(folderPath).then(function (paths) {
            // console.log('Deleted files/folders:\n', paths.join('\n'));

            if (program.verbose) {
                console.log(chalk.green(indent + indent + 'Done!'));
                console.log(indent + 'Cleaning up temporary directories...');
            }

            fs.rename('./' + tmpFolderName, './' + folderPath, function (err) {
                if (err) {
                    throw err;
                }
                if (program.verbose) {
                    console.log(chalk.green(indent + indent + 'Done!'));
                }
                console.log(chalk.green(indent + 'Bower component "' + json.name + '" has been replaced by its git repository'));
                process.exit(0);
            });

        }, function () {
            console.error(chalk.red(indent + 'Could not delete ' + folderPath));
            console.log(indent + 'Cleaning up temporary directories...');
            del(tmpFolderName).then(function (paths) {
                console.log(indent + indent + 'Done!');
                console.log(chalk.red(indent + 'Aborted'));
            });
            process.exit(1);
        });
    });

});
