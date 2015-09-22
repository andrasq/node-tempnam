/**
 * Copyright (C) 2014-2015 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

var fs = require('fs');
var tempnam = require('./index.js');

module.exports = {
    'should parse package.json': function(t) {
        require('./package.json');
        t.done();
    },

    'tempnam.uniqid should return a unique id': function(t) {
        var a, b;
        a = tempnam.uniqid('x');
        b = tempnam.uniqid('x');
        t.equals(a[0], 'x');
        t.ok(a != b);
        t.done();
    },

    'returns error if unable to create file': function(t) {
        tempnam("/nonesuch", function(err, filename) {
            t.ok(err, "should signal error if unable to access");
            t.done();
        });
    },

    'creates file in TMPDIR with no prefix': function(t) {
        var oldTmpdir = process.env.TMPDIR;
        var tmpdir = __dirname + '/tmp';
        process.env.TMPDIR = tmpdir;
        try { fs.mkdirSync(__dirname + '/tmp') } catch (err) { }
        t.expect(3);
        tempnam(function(err, filename) {
            var index = filename.indexOf(tmpdir);
            var name = filename.slice(tmpdir.length);
            process.env.TMPDIR = oldTmpdir;
            t.ok(index === 0);
            t.equal(name[0], '/');
            t.equal(name.length, 1+6);
            fs.unlinkSync(filename);
            fs.rmdirSync(tmpdir);
            t.done();
        });
    },

    'creates file in the specified directory with given prefix': function(t) {
        var dir = "/tmp";
        var prefix = "tempnam-test";
        var fd;
        tempnam(dir, prefix, function(err, filename) {
            // FIXME: on error, nodeunit wrongly passes the ifError() test,
            // then dies on the exception from unlink (could not create err)
            t.ifError(err);
            t.ok(fd = fs.openSync(filename, 'r'), "file should exist");
            fs.unlinkSync(filename);
            fs.closeSync(fd);
            t.equals(dir + "/" + prefix, filename.slice(0, dir.length + 1 + prefix.length));
            t.done();
        });
    },

    'different calls create different filenames': function(t) {
        tempnam("/tmp", "maketemp-test", function(err, file1) {
            t.ifError(err);
            tempnam("/tmp", "maketemp-test", function(err, file2) {
                t.ifError(err);
                t.notEqual(file1, file2);
                fs.unlinkSync(file1);
                fs.unlinkSync(file2);
                t.done();
            });
        });
    },

    'synchronous mode returns filename': function(t) {
        var filename = tempnam();
        t.ok(typeof filename === 'string');
        fs.unlinkSync(filename);
        t.done();
    },

    'synchronous mode returns error object on error': function(t) {
        var filename = tempnam("/nonesuch");
        t.ok(filename instanceof Error);
        t.ok(filename.message.indexOf('ENOENT') >= 0)
        t.done();
    },
};
