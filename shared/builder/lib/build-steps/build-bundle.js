'use strict';

var Lodash = require('lodash');
var Path = require('path');

var BuildHelpers = require('./build-helpers');
var EsprimaHelpers = require('./esprima-helpers');
var PathingHelpers = require('./storage-helpers/pathing');

var CLOSE_ARRAY = ']';
var COMMA = ',';
var NEWLINE = '\n';
var NEWLINE_REGEXP = /\n/g;
var OPEN_ARRAY = '[';
var QUOTE = '\'';
var TAB = '    '; // 4 spaces!

function indent(str) {
    return (TAB + str).replace(NEWLINE_REGEXP, NEWLINE + TAB);
}

function iifeWrap(code) {
    return '(function(){\n' + code + '\n}());';
}

function copyright() {
    var startYear = '2015';
    var currYear = new Date().getFullYear().toString();
    var yearStr = startYear;
    if (currYear !== startYear) {
        yearStr += ('-' + currYear);
    }
    return '// Copyright ' + yearStr + ' (c) Famous Industries, Inc.';
}

function getFlatIncludes(flatIncludes, parcelHash) {
    if (parcelHash.includes) {
        flatIncludes = flatIncludes.concat(parcelHash.includes);
    }
    if (parcelHash.dependencies) {
        for (var dependencyName in parcelHash.dependencies) {
            getFlatIncludes(flatIncludes, parcelHash.dependencies[dependencyName]);
        }
    }
    return Lodash.uniq(flatIncludes);
}

function buildIncludesPrefix(parcelHash) {
    var flatIncludes = getFlatIncludes([], parcelHash);
    return 'BEST.includes(' + JSON.stringify(flatIncludes) + ',function(){';
}

function getFlatRegistrations(flatRegistrations, alreadyRegistered, parcelHash) {
    if (parcelHash.entrypoint) {
        flatRegistrations.unshift(parcelHash.entrypoint);
    }
    if (parcelHash.dependencies) {
        for (var dependencyName in parcelHash.dependencies) {
            getFlatRegistrations(flatRegistrations, alreadyRegistered, parcelHash.dependencies[dependencyName]);
        }
    }
    return flatRegistrations;
}

function buildRegistrationBlocks(parcelHash) {
    var flatRegistrations = getFlatRegistrations([], {}, parcelHash);
    return flatRegistrations.join(NEWLINE);
}

function buildIncludesSuffix() {
    return '});'
}

function buildBundleString(info) {
    return [
        copyright(),
        '\'use strict\';',
        buildIncludesPrefix(info.parcelHash),
        indent(buildRegistrationBlocks(info.parcelHash)),
        buildIncludesSuffix(),
        copyright()
    ].join(NEWLINE);
}

function normalizeDependenciesFound(dependenciesFound) {
    var normalized = {};
    for (var depName in dependenciesFound) {
        var depJSON = dependenciesFound[depName];
        if (typeof depJSON === 'string') {
            normalized[depName] = JSON.parse(depJSON);
        }
        else {
            normalized[depName] = depJSON;
        }
    }
    return normalized;
}

function buildEntrypointString(info) {
    return EsprimaHelpers.generate(info.entrypointAST);
}

function buildParcelHash(info) {
    return {
        name: info.name,
        version: info.versionRef,
        timestamp: Date.now(),
        includes: BuildHelpers.buildIncludesArray(info),
        dependencies: normalizeDependenciesFound(info.dependenciesFound),
        entrypoint: buildEntrypointString(info)
    };
}

function buildBundle(info, cb) {
    info.parcelHash = buildParcelHash(info);
    info.bundleString = buildBundleString(info);
    cb(null, info);
}

module.exports = buildBundle;
