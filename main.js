var Q = require('q');
var _ = require('lodash');
var webpage = require('webpage');


var baseUrl = 'http://www.phantomjs.org/';
var views = {
    "documentation": [],
    "download": []
};


function shoot(url, filePath) {
    var page = require('webpage').create();

    var result = Q.defer();
    page.onLoadFinished = function() {
        console.log(filePath + '.png');
        page.render(filePath + '.png');

        result.resolve();
        page.close();
    };

    page.open(url);

    return result.promise;
}


function main() {
    var shoots = [];
    _.each(views, function(value, key) {
        var fullUrl = baseUrl + key;
        shoots.push(shoot(fullUrl, key));
    });

    Q.all(shoots).done(function() {
        phantom.exit();
    });
}

main();
