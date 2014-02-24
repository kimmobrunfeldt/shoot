var program = require('commander');


function list(val) {
    return val.split(',');
}

program
    .usage('[options] <url>')
    .option('-r, --resolutions [resolutions]', 'Resolutions in format [width]x[height]', list)
    .option('-o, --output-dir [output-dir]', 'Output directory')
    .option('-c, --crawl', 'Enables crawl mode')
    .parse(process.argv);


module.exports = {
    crawl: program.crawl || false,
    resolutions: program.resolutions || ['800x600'],
    outputDir: program.outputDir || '.shoot',
    url: program.args[0]
};