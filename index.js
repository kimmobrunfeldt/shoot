#!/usr/bin/env node

var Q = require('q');
var _ = require('lodash');
var _s = require('underscore.string');
var url = require('url');
var pageres = require('pageres');
var path = require('path');
var Tarantula = require('tarantula');


var sysargs = process.argv.slice(2);


function urlsInSameHost(url1, url2) {
    var host1 = url.parse(url1).host;
    var host2 = url.parse(url2).host;
    return host1 === host2;
}


function main() {
    if (!sysargs[0] || sysargs[0] == '-h' || sysargs[0] == '--help') {
        console.log('Usage: node index.js <url> [resolution]');
        console.log('Examples: ');
        console.log('  node index.js http://google.com');
        console.log('  node index.js http://google.com 800x600');
        process.exit(1);
    }

    var baseUrl = sysargs[0];
    var resolution = sysargs[1] || '1366x768';


    var brain = {
        legs: 8,
        shouldVisit: function(uri) {
            return urlsInSameHost(baseUrl, uri.uri);
        }
    };

    var tarantula = new Tarantula(brain);

    tarantula.on('data', function(uri) {
        var crawlUrl = uri.uri;
        console.log('Processing', crawlUrl, '..');

        var resolutionPath = path.join('shoot', resolution);
        var dirPath = path.join(resolutionPath, url.parse(crawlUrl).pathname);
        var filePath = path.join(dirPath, 'index');

        pageres([{
            url: crawlUrl,
            filePath: filePath
        }], [resolution], function() {
            console.log('Saved', crawlUrl, '->', filePath);
        });
    });

    tarantula.on('done', function() {
        console.log('Crawling done.');
    });

    tarantula.on('error', function(uri) {
        var errorUrl = uri.uri;
        console.log('Skipped', errorUrl);
    });

    tarantula.start([baseUrl]);
}

main();