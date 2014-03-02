#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var Q = require('q');
var program = require('commander');
var glob = require('glob');
var clc = require('cli-color');
var _error = clc.red.bold;
var _info = clc.bold;

var Shoot = require('./shoot');
var crawlers = require('./crawlers');
var utils = require('./utils');


function main() {
    parseArgs();
    var options = mergeDefaultsWithArgs(require('./config'));

    confirmClean(options)
    .then(function() {
        return utils.rmDir(options.outputDir);
    })
    .then(function() {
        if (options.crawl) {
            return crawl(options.urls, options);
        }
        return options.urls;
    })
    .then(function(urls) {
        return takeScreenshots(urls, options);
    })
    .fail(function(error) {
        if (error) {
            console.error(error.stack);
        }
        process.exit(1);
    });
}

function parseArgs() {
    function list(val) {
        return val.split(',');
    }

    program
        .usage('[options] <url>')
        .option('-r, --resolutions [resolutions]', 'resolutions in format 800x600[,1024x768]', list)
        .option('-o, --output-dir [output-dir]', 'output directory')
        .option('-u, --urls [urls]', 'read urls from file containing url per line')
        .option('-c, --crawl', 'enables crawl mode')
        .option('-f, --force', 'force delete files and directories')
        .parse(process.argv);

    program.on('--help', function(){
        console.log('  Examples:');
        console.log('');
        console.log('   - Take screenshot of single page');
        console.log('');
        console.log('       $ shoot http://google.com');
        console.log('');
        console.log('   - Take screenshots of all pages within site');
        console.log('');
        console.log('       $ shoot --crawl http://google.com');
        console.log('');
        console.log('  For more details, visit https://github.com/kimmobrunfeldt/shoot');
        console.log('');
    });
}

function mergeDefaultsWithArgs(config) {
    var options = {
        crawl: program.crawl || config.crawl,
        resolutions: program.resolutions || config.resolutions,
        outputDir: program.outputDir || config.outputDir,
        force: program.force || config.force,
        crawler: config.crawler
    };
    // Confirm should be asked if the output dir is specified and it is not default
    var shouldAskConfirm = !_.isUndefined(program.outputDir) &&
                           program.output !== config.outputDir;
    options.confirm = shouldAskConfirm && !config.force;

    if (program.urls) {
        options.urls = utils.readLines(program.urls);
        console.info('Read', options.urls.length, 'urls from', program.urls);
    } else {
        options.urls = [program.args[0]];
    }
    options.urls = _.compact(options.urls);

    if (_.isEmpty(options.urls)) {
        program.help();
    }
    return options;
}

function confirmClean(options) {
    var def = Q.defer();

    var dir = options.outputDir;
    if (fs.existsSync(dir) && options.confirm) {
        var isDir = fs.lstatSync(dir).isDirectory();

        if (!isDir) {
            def.reject(new Error('Error deleting', dir + ': Not a directory'));
            return;
        }

        utils.ask('Delete *.png from ' + dir + ' ? [Y/n]').done(function(answer) {
            if (answer === '' || answer.toLowerCase() === 'y') {
                var filePaths = glob.sync(path.join(dir, '/*/*.png'));
                _.each(filePaths, function(filePath) {
                    fs.unlinkSync(filePath);
                });
                def.resolve();
            } else {
                def.reject();
            }
        });
    } else {
        def.resolve();
    }

    return def.promise;
}

function crawl(urls, opts) {
    var self = this;
    var def = Q.defer();

    if (!_.has(crawlers, opts.crawler))
        throw new Error('No such crawler, ' + opts.crawler);

    var crawler = new crawlers[opts.crawler]();
    crawler.on('page', function onPage(page) {
        console.info(page.url);
        var appendFilePath = path.join(opts.outputDir, 'urls.log');
        fs.appendFile(appendFilePath, page.url + '\n', function(err) {});
    });

    crawler.on('done', function onDone(urls) {
        def.resolve(urls);
    });

    crawler.on('error', function onError(error) {});

    crawler.start(urls);
    return def.promise;
}

function takeScreenshots(urls, options) {
    var shoot = new Shoot(options);
    return shoot.start(urls);
}

main();
