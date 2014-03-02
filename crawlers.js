// Contains all crawlers
// Crawler must:
// - Implement .start(urls) method
// - Emit 'page' on visited page
// - Emit 'error' from error
// - Emit 'done' when completed

var util = require('util');
var _url = require('url');
var Tarantula = require('tarantula');
var _s = require('underscore.string');


// Crawls static pages using Cheerio
function StaticCrawler(opts) {
    opts = opts || {};

    this.brain = {
        legs: 8,
        // Dont visit external sites
        stayInRange: opts.stayInRange || true
    };
}
util.inherits(StaticCrawler, require('events').EventEmitter);

StaticCrawler.prototype.start = function start(urls) {
    var self = this;
    var baseUrls = urls;

    this.tarantula = new Tarantula(this.brain);

    var foundUrls = [];

    this.tarantula.on('data', function onData(uri) {
        var crawlUrl = uri.uri;
        foundUrls.push(crawlUrl);
        self.emit('page', {
            url: crawlUrl
        });
    });

    this.tarantula.on('done', function onDone() {
        self.emit('done', foundUrls);
    });

    this.tarantula.on('error', function onError(uri, e, error) {
        self.emit('error', {
            url: uri.uri,
            error: error
        });
    });

    this.tarantula.start(urls);
};

module.exports = {
    StaticCrawler: StaticCrawler
};