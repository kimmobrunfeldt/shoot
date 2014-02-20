var Q = require('q');
var _ = require('lodash');
var _s = require('underscore.string');

var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var pageres = require('pageres');
var path = require('path');

var sysargs = process.argv.slice(2);


var MAX_DEPTH = 3;
var LOWERCASE = false;
var STAY_ON_BASE = true;


var Spider = (function() {

    var visited = [];
    var initialUrl;

    function findUrls(html) {
        $ = cheerio.load(html);

        var urls = [];
        $('a').each(function() {
            urls.push($(this).attr('href'));
        });
        return urls;
    }

    function processUrl(pageUrl, depth, cb) {
        visited.push(fixUrlCase(pageUrl));
        cb(pageUrl);
        console.log(pageUrl, depth, isVisited(pageUrl));

        if (depth > MAX_DEPTH) {
            return;
        }

        request(pageUrl, function(error, response, body) {
            console.log('request', pageUrl);
            if (!error && _s.include(response.headers['content-type'], 'text/html') && response.statusCode == 200) {
                var urls = findUrls(body);

                var visitNext = _.filter(urls, function(u) {
                    u = formatUrl(pageUrl, u);
                    return u && !isVisited(u) && !isOutsideBase(u);
                });

                _.each(visitNext, function(u) {
                    processUrl(formatUrl(pageUrl, u), depth + 1, cb);
                });
            }
        });
    }

    function isVisited(pageUrl) {
        return _.indexOf(visited, pageUrl) !== -1;
    }

    function isOutsideBase(pageUrl) {
        var host = url.parse(pageUrl).host;
        var initialHost = url.parse(initialUrl).host;
        console.log(initialUrl, pageUrl);
        console.log(initialHost, host);
        return host !== initialHost;
    }

    function fixUrlCase(pageUrl) {
        return LOWERCASE ? pageUrl.toLowerCase() : pageUrl;
    }

    function formatUrl(baseUrl, link) {
        if (!_s.startsWith(link, 'http')) {
            if (!_s.endsWith(baseUrl, '/')) baseUrl += '/';
            if (_s.startsWith(link, '/')) link = link.slice(1);
            return baseUrl + link;
        }

        return fixUrlCase(link);
    }

    return {
        crawl: function(pageUrl, cb) {
            initialUrl = pageUrl;
            processUrl(pageUrl, 0, cb);
        }
    };
})();



function main() {
    if (!sysargs[0]) {
        console.log("Usage: node index.js http://google.com");
        process.exit(1);
    }

    var baseUrl = sysargs[0];

    Spider.crawl(baseUrl, function(crawlUrl) {
        var dirPath = path.join('shoot', url.parse(crawlUrl).pathname);
        var filePath = path.join(dirPath, 'index');

        pageres([{
            url: crawlUrl,
            filePath: filePath
        }], ['1366x768'], function() {
            console.log('Saved ', crawlUrl);
        });
    });


}

main();