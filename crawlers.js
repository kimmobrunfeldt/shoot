// Contains all crawlers
// Crawler must:
// - Implement .start(urls) method
// - Emit 'page' on visited page
// - Emit 'error' from error
// - Emit 'done' when completed

var Tarantula = require('tarantula');
var _url = require('url');
var _s = require('underscore.string');

function LinkCrawler() {}
LinkCrawler.prototype = Object.create(require('events').EventEmitter.prototype);

LinkCrawler.prototype.start = function start(urls) {
    var self = this;

    var baseUrls = urls;

    this.brain = {
        legs: 8,
        // Dont visit external sites
        stayInRange: true
    };

    this.tarantula = new Tarantula(this.brain);

    var foundUrls = [];

    this.tarantula.on('data', function onData(uri) {
        var crawlUrl = uri.uri;
        foundUrls.push(crawlUrl);
        self.emit('page', {url: crawlUrl});
    });

    this.tarantula.on('done', function onDone() {
        self.emit('done', foundUrls);
    });

    this.tarantula.on('error', function onError(uri, e, error) {
        self.emit('error', {url: uri.uri, error: error});
    });

    this.tarantula.start(urls);
};

module.exports = {
    LinkCrawler: LinkCrawler
};
