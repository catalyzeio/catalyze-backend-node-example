"use strict";

var yaml = require("js-yaml");
var fs = require("fs");

module.exports = yaml.safeLoad(fs.readFileSync("config.yml"));
