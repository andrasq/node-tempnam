/**
 * Copyright (C) 2014-2017 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

var fs = require('fs');
var tempnam = require('./');

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
        t.expect(4);
        tempnam(function(err, filename) {
            t.ifError(err);
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

    'creates file in /tmp if TMPDIR not set': function(t) {
        var oldTmpdir = process.env.TMPDIR;
        delete process.env.TMPDIR;
        tempnam(function(err, filename) {
            t.ifError(err);
            process.env.TMPDIR = oldTmpdir;
            fs.unlinkSync(filename);
            t.equal(filename.slice(0, 5), "/tmp/");
            t.done();
        })
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

    'retries if tempnam already exists': function(t) {
        try { fs.unlinkSync('/tmp/utest-000001') } catch (err) { }
        try { fs.unlinkSync('/tmp/utest-000002') } catch (err) { }
        mathRandom = Math.random;
        values = [1, 1, 2];
        Math.random = function() { return values.shift() / 0x1000000; }
        tempnam("/tmp", "utest-", function(err, file1) {
            t.ifError(err);
            tempnam("/tmp", "utest-", function(err, file2) {
                t.ifError(err);
                fs.unlinkSync(file1);
                fs.unlinkSync(file2);
                Math.random = mathRandom;
                t.equal(file1, '/tmp/utest-000001');
                t.equal(file2, '/tmp/utest-000002');
                t.done();
            })
        })
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

    'synchronous mode retries if tempnam already exists': function(t) {
        try { fs.unlinkSync('/tmp/utest-000001') } catch (err) { }
        try { fs.unlinkSync('/tmp/utest-000002') } catch (err) { }
        mathRandom = Math.random;
        values = [1, 1, 2];
        Math.random = function() { return values.shift() / 0x1000000; }
        var name1 = tempnam("/tmp", "utest-");
        var name2 = tempnam("/tmp", "utest-");
        fs.unlinkSync(name1);
        fs.unlinkSync(name2);
        t.equal(name1, '/tmp/utest-000001');
        t.equal(name2, '/tmp/utest-000002');
        t.done();
    },

    'synchronous mode return errors if unable to find an unused filename': function(t) {
        var mathRandom = Math.random;
        Math.random = function(){ return 1 / 0x1000000 };
        try { fs.unlinkSync('/tmp/utest-000001') } catch (err) { }
        var fd1 = tempnam("/tmp", "utest-");
        var err = tempnam("/tmp", "utest-");
        Math.random = mathRandom;
        t.equal(err.code, 'EEXIST');
        t.equal(err.message.indexOf('EEXIST: file already exists'), 0);
        t.done();
    },

    'tempnamSync should return a tempnam': function(t) {
        var filename = tempnam.tempnamSync("/tmp", "utest-");
        t.equal(typeof filename, 'string');
        fs.unlinkSync(filename);
        t.done();
    },

    'tempnamSync should reject a callback': function(t) {
        try {
            tempnam.tempnamSync("/tmp", function(){});
            t.fail();
        } catch (err) {
            t.ok(err.message.indexOf('callback') >= 0);
            t.done();
        }
    }
};
