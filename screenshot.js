var Q = require('q');
var _ = require('lodash');
var url = require('url');
var webpage = require('webpage');
var sysargs = require('system').args.slice(1);


function screenshot(pageUrl, filePath) {
    var page = require('webpage').create();

    var result = Q.defer();
    page.open(pageUrl, function() {
        setTimeout(function() {
            console.log('Saving file', filePath, '..');
            page.render(filePath);
            page.close();
            result.resolve();
        }, 200);
    });

    return result.promise;
}


function main() {
    if (!sysargs[0] || !sysargs[1]) {
        console.log("Usage: phantomjs screenshot.js http://google.com google.png");
        phantom.exit(1);
    }

    Q.all([
        screenshot(sysargs[0], sysargs[1])
    ]).done(function() {
        console.log('exit');
        phantom.exit();
    });
}

main();
