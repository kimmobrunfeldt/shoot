#!/usr/bin/env node

var Q = require('q');
var _ = require('lodash');
var _s = require('underscore.string');
var url = require('url');
var pageres = require('pageres');
var path = require('path');
var Tarantula = require('tarantula');
var colors = require('colors');
var rmdir = require('rimraf');


var sysargs = process.argv.slice(2);


function formatUrl(baseUrl, link) {
    if (!_s.startsWith(link, 'http')) {
        if (!_s.endsWith(baseUrl, '/')) baseUrl += '/';
        if (_s.startsWith(link, '/')) link = link.slice(1);
        return baseUrl + link;
    }

    return link;
}

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
            return urlsInSameHost(baseUrl, formatUrl(baseUrl, uri));
        }
    };

    var tarantula = new Tarantula(brain);
    var urls = [];

    tarantula.on('data', function(uri) {
        var crawlUrl = uri.uri;
        var msg = crawlUrl + ' ..';
        console.log(msg.bold);

        urls.push(crawlUrl);
    });

    tarantula.on('done', function() {
        console.log('Crawling done.'.bold);

        var shots = [];

        _.each(urls, function(u) {
            var resolutionPath = path.join('shoot', resolution);
            var dirPath = path.join(resolutionPath, url.parse(u).pathname);
            var filePath = path.join(dirPath, 'index');
            shots.push({
                url: u,
                filePath: filePath
            });
        });

        pageres(shots, [resolution], function() {
            //var msg = 'Saved ' + crawlUrl + ' -> ' + filePath;
            console.log('All images saved'.bold);
        });

    });

    tarantula.on('error', function(uri, e, error) {
        var errorUrl = uri.uri;
        var msg = 'Error processing ' + errorUrl;
        console.log(msg.red.bold);
        console.log(error);
    });

    console.log('Removing old shoot directory..'.bold);
    rmdir('shoot', function(error) {
        if (!error) return;

        console.log('Error deleting shoot directory'.red.bold);
        console.log(error);
    });

    var msg = 'Start crawling from ' + baseUrl;
    console.log(msg.bold);
    tarantula.start([baseUrl]);
}

main();