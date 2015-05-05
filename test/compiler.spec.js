'use strict';

var Tape = require('tape');
var Compiler = require('./../lib/compiler/compiler');
var content = require('./fixtures/entrypoint-contents');

Tape('compiler', function(t) {
    t.plan(2);
    t.ok(Compiler, 'exports');
    t.ok(new Compiler(), 'instance');
    Compiler.compileModule(content.name, content.tag, content.files, {}, function(err, result) {
        // console.log(err, result);
    });
});
