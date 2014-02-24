// All crawlers

var events = require('events');
var Tarantula = require('tarantula');
var _url = require('url');
var _s = require('underscore.string');


var LinkCrawler = (function LinkCrawler() {

    this.brain = {
        legs: 8,
        shouldVisit: function(uri) {
            return urlsInSameHost(baseUrl, formatUrl(baseUrl, uri));
        }
    };

    this.tarantula = new Tarantula(brain);
});

LinkCrawler.prototype = new events.EventEmitter();

// Public

LinkCrawler.prototype = function start(urls) {
    var self = this;
    var foundUrls = [];

    this.tarantula.on('data', function onData(uri) {
        var crawlUrl = uri.uri;
        console.info('Crawl', crawlUrl);

        foundUrls.push(crawlUrl);
        self.emit('page', {url: crawlUrl});
    });

    this.tarantula.on('done', function onDone() {
        console.info('Crawling done.');
        self.emit('done', foundUrls);
    });

    this.tarantula.on('error', function onError(uri, e, error) {
        console.error('Error processing ' + uri.uri);
        console.error(error);
        self.emit('error', {url: uri.uri, error: error});
    });

    this.tarantula.start(urls);
};

// Private

function formatUrl(baseUrl, link) {
    if (!_s.startsWith(link, 'http')) {
        if (!_s.endsWith(baseUrl, '/')) baseUrl += '/';
        if (_s.startsWith(link, '/')) link = link.slice(1);
        return baseUrl + link;
    }

    return link;
}

function urlsInSameHost(url1, url2) {
    var host1 = _url.parse(url1).host;
    var host2 = _url.parse(url2).host;
    return host1 === host2;
}

module.exports = {
    LinkCrawler: LinkCrawler
};
