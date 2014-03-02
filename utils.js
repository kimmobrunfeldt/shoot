var Q = require('q');
var fs = require('fs');
var rmdir = require('rimraf');
var read = require('read');
var _s = require('underscore.string');

var config = require('./config');


module.exports = {
    rmDir: function(dir) {
        var def = Q.defer();

        rmdir(config.outputDir, function(error) {
            if (!error) {
                def.resolve();
                return;
            }
            def.reject(error);
        });

        return def.promise;
    },

    readLines: function readLines(path) {
        var contents = fs.readFileSync(path).toString();
        return _s.words(contents, '\n');
    },

    /**
    Asynchronously prompt the user for stdin inputs, using promises.

    @param question a string that will be outputed to the stdout.
    @return a promise object that will be resolved from what we get from
          from the stdin.
    */
    ask: function ask(question) {
        var def = Q.defer();

        process.stdout.write(question + ' ');

        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', function(chunk) {
            // This is mostly to target new-line characters, but any whitespace
            // characters will be axed, as well.
            chunk = chunk.trim();
            def.resolve(chunk);
            process.stdin.pause();
        });

        return def.promise;
    }
};