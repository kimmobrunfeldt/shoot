// PhantomJS script
// Takes screeshot of a given page. This correctly handles pages which
// dynamically load content making AJAX requests.

// Instead of waiting fixed amount of time before rendering, we give a short
// time for the page to make additional requests.


var _ = require('lodash');


var defaultOpts = {
    ajaxTimeout: 300,
    maxTimeout: 10000,
    width: 1280,
    height: 1024,
    file: undefined
};

var Page = (function(opts) {

    opts = _.extend(defaultOpts, opts);

    var page = require('webpage').create();
    var requestCount = 0;
    var forceRenderTimeout;
    var ajaxRenderTimeout;

    var api = {};

    api.render = function(url) {
        page.open(url, function(status) {
            if (status !== "success") {
                console.error('Unable to load url:', url);
                phantom.exit();
            } else {
                forceRenderTimeout = setTimeout(render, opts.maxTimeout);
            }
        });
    };

    function render() {
        page.render(opts.file);
    }

    page.onResourceRequested = function(request) {
        requestCount += 1;
        console.log('> ' + request.id + ' - ' + request.url);
        clearTimeout(ajaxRenderTimeout);
    };

    page.onResourceReceived = function(response) {
        if (!response.stage || response.stage === 'end') {
            requestCount -= 1;
            console.log(response.id + ' ' + response.status + ' - ' + response.url);
            if (requestCount === 0) {
                ajaxRenderTimeout = setTimeout(render, opts.ajaxTimeout);
            }
        }
    };

    return api;
});

function die(error) {
    console.error(error);
    phantom.exit(1);
}

function main() {
    var args = require('system').args;

    var url = args[1];
    var file = args[2];
    console.log(url, file)

    if (!url) die('Url parameter must be specified');
    if (!file) die('File parameter must be specified');

    var opts = {
        file: file
    };

    var page = Page(opts);
    page.render(url);
}


main();
