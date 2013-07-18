#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var URL_DEFAULT = "http://shrouded-fjord-1085.herokuapp.com/";
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var urlFile = "url.html";

var assertUrlExists = function(url) {
	var urlString = url.toString();
    return urlString;
};

var getUrlHtml = function(url, checksfile) {
    rest.get(url).on('complete', function(result){
        writeHtml(url, result);
        $ = cheerio.load(fs.readFileSync(urlFile));
        proceedCheck($, checksfile);
    });
};

var writeHtml = function(url, result) {
    if (result instanceof Error) {
        console.log("%s returns error. Exiting.", url);
        process.exit(1);
    } else {
        fs.writeFileSync(urlFile, result);
    }
};

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); //http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var checkHtmlFile = function(indicator, htmlfile, checksfile) {
	if(indicator.match(/url/g) !=null){
        getUrlHtml(htmlfile, checksfile);
	}
	else{
		$ = cheerio.load(fs.readFileSync(htmlfile));
        proceedCheck($, checksfile);
	}
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var proceedCheck = function($, checksfile){
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    displayResult(out);
};

var displayResult = function(checkJson){
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

// return the current file
var inputFile = function(input, htmlfile, urlfile){
	// input is urlfile
	if (input.match(/url/g) != null){
		return urlfile;
	}
	return htmlfile; 
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <url_file>', 'Path to url', clone(assertUrlExists), URL_DEFAULT)
        .parse(process.argv);	
	var fileIndicator = process.argv[4] || '--file';
	var selectedFile = inputFile(fileIndicator, program.file, program.url);
	checkHtmlFile(fileIndicator, selectedFile, program.checks);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
