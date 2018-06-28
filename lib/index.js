
var chalk = require('chalk'); // TODO: remove
var fs = require('fs');
var path = require('path');
var del = require('del');
var exec = require('child_process').exec;

var indent = '  ';

function run(options) {
    options = options || {};

    var promise;
    var folderPath = options.path;
    var branch = options.branch;

    if (!folderPath) {
        // console.error(chalk.red(indent + 'ABORTING: No path provided!'));
        throw 'ABORTING: No path provided!';
    }

    // find platform folder
    if (!fs.existsSync(folderPath)) {
        throw 'ABORTING: Folder "' + folderPath + '" does not exist';
    }

    // find bower json
    var bowerPath = path.join(folderPath, 'bower.json');

    // find folder name
    var dirName = path.dirname(folderPath);
    var folderName = path.basename(folderPath);

    if (!fs.existsSync(bowerPath)) {
        throw 'ABORTING: No bower.json found in ' + folderPath;
    }

    fs.readFile(bowerPath, function(err, data) {
        'use strict';
        if (err) {
            throw err;
        }

        var json = JSON.parse(data);
        var url;
        var checkout = branch ? '-b ' + branch : '';
        var tmpFolderName = path.join(dirName, 'tmp' + Date.now());

        if (options.verbose) {
            console.log(indent + 'Found bower component: ' + json.name);
        }

        if (!json.repository || !json.repository.url || !json.repository.type) {
            throw('ABORTING: No repository information found in bower.json');
        }

        if (json.repository.type !== 'git') {
            throw('ABORTING: Not a git repository');
        }

        if (!module.exports.testMode) {
            console.log(indent + 'Replacing bower component with git repository...');
        }

        url = json.repository.url;

        if (options.verbose) {
            console.log(indent + 'Cloning from ' + url + ' to temporary directory...');
        }

        exec('git clone ' + url + ' ' + checkout + ' ' + tmpFolderName, function(err) {
            if (err) {
                throw err;
            }

            if (options.verbose) {
                console.log(chalk.green(indent + indent + 'Done!'));
                console.log(indent + 'Deleting bower component folder...');
            }

            // TODO: rename old folder before removing to be able to fallback
            // 1. rename old folder to tmp
            // 2. rename new folder to component name
            // 3. delete old folder

            promise = del(folderPath).then(function(paths) {
                // console.log('Deleted files/folders:\n', paths.join('\n'));

                if (options.verbose) {
                    console.log(chalk.green(indent + indent + 'Done!'));
                    console.log(indent + 'Cleaning up temporary directories...');
                }

                fs.rename('./' + tmpFolderName, './' + folderPath, function(err) {
                    if (err) {
                        throw err;
                    }
                    if (options.verbose) {
                        console.log(chalk.green(indent + indent + 'Done!'));
                    }
                    console.log(chalk.green(indent + 'Bower component "' + json.name + '" has been replaced by its git repository'));
                });

            }).catch(function() {
                // console.log('del throws');
                if (!module.exports.testMode) {
                    console.log(indent + 'Cleaning up temporary directories...');
                }

                del(tmpFolderName).then(function(paths) {
                    console.log(indent + indent + 'Done!');
                    console.log(chalk.red(indent + 'Aborted'));
                });
                throw('Could not delete bower component in ' + folderPath);
            });
        });

    });

    return promise;
}

module.exports = run;
module.exports.testMode = false;
