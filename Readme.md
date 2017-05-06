tempnam
=======

[![Build Status](https://api.travis-ci.org/andrasq/node-tempnamq.svg?branch=master)](https://travis-ci.org/andrasq/node-tempnamq?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/andrasq/node-tempnamq/badge.svg?branch=master)](https://coveralls.io/github/andrasq/node-tempnamq?branch=master)

## Summary

PHP tempnam() work-alike, creates a tempfile guaranteed to be new.

        tempnam = require('tempnam');
        tempnam("/tmp", "my-prefix-", function(err, filename) {
            // => "/tmp/my-prefix-a7259b"
        })


## Installation

        npm install tempnam
        npm test tempnam


## Functions

### tempnam( [directory] [,prefix] [,callback(err, filename)] )

PHP [tempnam()](http://php.net/manual/en/function.tempnam.php) equivalent,
creates a filename that does not exist on the
system.  Like PHP, it also creates the file to prevent the name from
being reused.  The default directory is process.env.TMPDIR (else /tmp),
and the default prefix is the empty string.

The tempfile is created in "wx+" O_CREAT|O_EXCL exclusive-access mode to
guarantee that it does not already exist, and with access permissions as set in
process.umask(), e.g. 0644 -rw-r--r--.  The file is closed immediately
thereafter.

Without a callback runs synchronously, and returns the filename string else an
error object if unable to create.  The callback, if it exists, is always the
last argument and is a function.

Tempnam() generates random filenames and retries on collision.  The more files
in the temp directory, the more chance of name collisions.  Although up to 16
million (2^24) files are possible, the retry approach breaks down when close
to the 16m limit (at 14 million it would take an average of 4 retries to find
an unused name, still ok, but at 15 million 11, not ok).  Note that 16 million
files in a single directory is unmanageable; `ls` and `echo *` do not work,
and it takes days to just delete them all off an ext3 filesystem with an
opendir/readdir/unlink loop written in C.


## Notes

- O_EXCL does not guarantee uniqueness on NFS v2 or older filesystems


## Related Work

- [tmp](https://npmjs.com/package/tmp) - complex "kitchen sink" tempfile and tempdir creator using crypto with automatic cleanup
