var Q = require('q');
var _ = require('lodash');
var _s = require('underscore.string');
var mkdirp = require('mkdirp');
var path = require('path');
var _url = require('url');
var screenshot = require('url-to-screenshot');
var fs = require('fs');

var crawlers = require('./crawlers');

var Shoot = function Shoot(opts) {
    var defaultOpts = {
        // Function which takes an url and converts it to filepath where
        // screenshot should be saved
        urlToPath: function(url, resolution) {
            var fileName = _url.parse(url).path;
            // Trim slashes
            fileName = _s.trim(fileName, '/');
            // Replaces slashes with -
            fileName = fileName.replace(/\//g, '-');

            if (!fileName) fileName = 'index';

            var resolutionPath = path.join(opts.outputDir, resolution);
            var filePath = path.join(resolutionPath, fileName + '.png');
            return filePath;
        }
    };

    this.opts = _.extend(defaultOpts, opts);
};

Shoot.prototype.start = function start(urls) {
    return this._takeScreenshots(this.opts.resolutions, urls);
};

// Take screenshots from urls with all resolutions
Shoot.prototype._takeScreenshots = function(resolutions, urls) {
    var self = this;
    var def = Q.defer();

    var resolution = resolutions.shift();
    console.log(resolutions);
    this._takeResolutionScreenshots(urls, resolution).done(function() {
        console.log(resolutions);
        if (_.isEmpty(resolutions)) {
            def.resolve();
        } else {
            self._takeScreenshots(resolutions, urls);
        }
    });

    return def.promise;
};

// Take screenshots from urls with given resolution
Shoot.prototype._takeResolutionScreenshots = function(urls, resolution) {
    var self = this;
    var def = Q.defer();

    var url = urls.shift();
    console.log(urls)
    this._takeScreenshot(url, resolution).done(function() {
        if (_.isEmpty(urls)) {
            def.resolve();
        } else {
            self._takeResolutionScreenshots(urls, resolution);
        }
    });

    return def.promise;
};

Shoot.prototype._takeScreenshot = function(url, resolution) {
    var self = this;
    var dfd = Q.defer();

    console.info('Taking screenshot of', url);

    var size = _s.words(resolution, 'x');
    screenshot(url, {
        width: size[0],
        height: size[1]
    }).capture(function(img) {
        var filePath = self.opts.urlToPath(url, resolution);
        var saveDir = path.dirname(filePath);

        if (!fs.existsSync(saveDir)) {
            mkdirp.sync(saveDir);
            console.info('Created directory', saveDir);
        }

        fs.writeFileSync(filePath, img);
        console.info('Saved', filePath);
        dfd.resolve();
    });

    return dfd.promise;
};

module.exports = Shoot;