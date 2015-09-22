/**
 * tempnam -- create a temporary file with a unique name
 *
 * Works like php tempnam(), it returns the pathname of a newly created file.
 * This filepath is guaranteed to not be returned by another tempnam() call
 * until it is removed.  The caller must delete any unneeded files.
 *
 * Copyright (C) 2014 Andras Radics
 * Licensed under the Apache License, Version 2.0
 *
 * 2014-09-23 - AR.
 */

fs = require('fs');

module.exports = tempnam;
tempnam.uniqid = uniqid;

function uniqid( prefix ) {
    prefix = prefix || "";
    var id = prefix + Math.floor(Math.random() * 0x1000000).toString(16);
    while (id.length < 6) id = "0" + id;
    return id;
}

function tempnam( directory, prefix, callback ) {
    'use strict';

    // TODO: accept an options block with
    //   mode:, prefix: , suffix:, directory:, pattern: 'fooXXXX', etc.

    if (!callback) {
        if (typeof prefix === 'function') { callback = prefix; prefix = null; }
        else if (!prefix && typeof directory === 'function') { callback = directory; prefix = directory = null; }
    }

    directory = directory || process.env.TMPDIR || "/tmp";
    prefix = prefix || "";

    var pathname = directory + "/" + uniqid(prefix);
    var createmode = (~process.umask() & parseInt('0666', 8));
    var attempts = 0;
    if (callback ) fs.open(pathname, "wx+", createmode, function(err, fd) {
        // with a callback run asynchronously
        if (!err) {
            fs.close(fd);
            return callback(null, pathname);
        }
        // TODO: limit max recursion depth to 100
        else if (err.message.indexOf('EEXIST, ') === 0) {
            return tempnam(directory, prefix, callback);
        }
        else {
            return callback(err);
        }
    });
    else {
        // without a callback run synchronously
        do {
            var fd = openSync(pathname, "wx+", createmode);
            if (typeof fd === 'number') {
                fs.closeSync(fd);
                return pathname;
            }
        } while (fd.message.indexOf('EEXIST, ') === 0 && attempts++ < 100);
        return fd;
    }

    function openSync(path, mode) {
        try { return fs.openSync(path, mode); } catch (err) { return err; }
    }
}