/**
 * tempnam -- create a temporary file with a unique name
 *
 * Works like php tempnam(), it returns the pathname of a newly created file.
 * This filepath is guaranteed to not be returned by another tempnam() call
 * until it is removed.  The caller must delete any unneeded files.
 *
 * Copyright (C) 2014,2017 Andras Radics
 * Licensed under the Apache License, Version 2.0
 *
 * 2014-09-23 - AR.
 */

'use strict';

var fs = require('fs');

module.exports = function(a,b,c) { return tempnam(a,b,c) };
module.exports.tempnam = tempnam;
module.exports.tempnamSync = tempnamSync;
module.exports.uniqid = uniqid;

var _zeroPad = [ "", "0", "00", "000", "0000", "00000", "000000" ];
function uniqid( prefix ) {
    prefix = prefix || "";
    var id = Math.floor(Math.random() * 0x1000000).toString(16);
    if (id.length < 6) id = _zeroPad[6 - id.length] + id;
    return prefix + id;
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
    if (callback) (function _retry() {
        fs.open(pathname, "wx+", createmode, function(err, fd) {
            // with a callback run asynchronously
            if (!err) {
                fs.close(fd);
                return callback(null, pathname);
            }
            else if ((err.code === 'EEXIST' || err.message.indexOf('EEXIST') === 0) && attempts++ < 100) {
                pathname = directory + "/" + uniqid(prefix);
                setImmediate(_retry);
            }
            else {
                return callback(err);
            }
        });
    })();
    else {
        // without a callback run synchronously
        do {
            var fd = openSync(pathname, "wx+", createmode);
            if (typeof fd === 'number') {
                fs.closeSync(fd);
                return pathname;
            }
            pathname = directory + "/" + uniqid(prefix);
        } while ((fd.code === 'EEXIST' || fs.message && fd.message.indexOf('EEXIST') === 0) && attempts++ < 100);
        // TODO: this should maybe throw, like other fs Sync functions
        return fd;
    }

    function openSync(path, mode) {
        try { return fs.openSync(path, mode); } catch (err) { return err; }
    }
}

function tempnamSync( directory, prefix ) {
    if (typeof prefix === 'function' || typeof directory === 'function') throw new Error("callback not expected");
    return tempnam(directory, prefix);
}
