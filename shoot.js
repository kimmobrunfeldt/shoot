var _ = require('lodash');
var path = require('path');
var _url = require('url');
var pageres = require('pageres');

var crawlers = require('./crawlers');
var config = require('./config');

var Shoot = function Shoot() {
};


Shoot.prototype.shoot = function shoot(urls, cb) {
    if (config.crawl) {
        crawl(urls).on('done', function onCrawlDone(foundUrls) {
            takeScreenshots(foundUrls);
        });
    } else {
        takeScreenshots(urls);
    }
};

function crawl(urls) {
    var crawler = new crawlers[config.crawler]();

    crawler.on('page', function onPage(page) {
    });

    crawler.on('done', function onDone(urls) {
    });

    crawler.on('error', function onError(error) {
    });

    crawler.start(urls);
    return crawler;
}

function takeScreenshots(urls) {
    _.each(config.resolutions, function(res) {
        takeResolutionScreenshots(urls, res);
    });
}

function takeResolutionScreenshots(urls, resolution) {
    var shots = [];

    _.each(urls, function(u) {
        var resolutionPath = path.join(config.outputDir, resolution);
        var dirPath = path.join(resolutionPath, _url.parse(u).pathname);
        var filePath = path.join(dirPath, 'index');
        shots.push({
            url: u,
            filePath: filePath
        });
    });

    pageres(shots, config.resolutions, function() {
        console.info('All images saved');
    });
}

module.exports = Shoot;
