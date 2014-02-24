#!/usr/bin/env node

var clc = require('cli-color');

var utils = require('./utils');
var config = require('./config');
var Shoot = require('./shoot');

var _error = clc.red.bold;
var _info = clc.bold;


function main() {
    utils.rmDirIfExists(config.outputDir, {confirm: true}, function onDirRemoved() {
        console.info('Start crawling from ' + config.url);

        var shoot = new Shoot();
        shoot.shoot([process.argv[2]]);
    });
}

main();