var fs = require('fs');
var rmdir = require('rimraf');
var read = require('read');

var config = require('./config');


module.exports = {
    rmDirIfExists: function rmDirIfExists(dir, opts, cb) {

        if (fs.existsSync(dir)) {
            var isDir = fs.lstatSync(dir).isDirectory();
            if (!isDir) {
                console.error('Error deleting', dir + ': Not a directory');
                return;
            }
        }

        // TODO: Fix this shitty repeating code
        if (opts.confirm) {
            read({
                prompt: 'Delete *.png files recursively from directory ' + dir + ' ? (y/n)'
            }, function(error, answer) {
                if (!error && answer === 'y') {
                    rmdir(config.outputDir, function(error) {
                        if (!error) {
                            cb();
                            return;
                        }
                        console.error('Error deleting shoot directory');
                        console.error(error);
                    });
                }
            });
        } else {
            rmdir(config.outputDir, function(error) {
                if (!error) {
                    cb();
                    return;
                }
                console.error('Error deleting shoot directory');
                console.error(error);
            });
        }

        return;
    }
};
