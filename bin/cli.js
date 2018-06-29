#!/usr/bin/env node
var bowerGit = require('../lib');
var program = require('commander');
var chalk = require('chalk');

var indent = '  ';
var options;

program
    .version(require('../package.json').version)
    .arguments('<path>')
    .option('-v, --verbose', '')
    .option('-b, --branch [value]', 'checkout specific branch', 'master')
    // .action(function(path) {
    //     var pathValue = path;
    // })
    .parse(process.argv);

if (!program.args.length) {
    program.help();
}

options = {
    path: program.args[0],
    verbose: program.verbose,
    branch: program.branch
};

// console.log(program);

try {
    bowerGit(options);
} catch (err) {
    console.error(chalk.red(indent + err));
    process.exit(1);
}
