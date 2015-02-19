tempnam
=======


## Summary

Php tempnam() work-alike, creates a tempfile guaranteed to be new.

        tempnam = require('tempnam');
        tempnam("/tmp", "my-tempfile-", callback(err, filename) {
            // => "/tmp/my-tempfile-a7259b"
        })


## Installation

        npm install tempnam
        npm test tempnam


## Functions

### tempnam( [directory], [prefix], callback(err, filename) )

php tempnam equivalent, creates a filename that does not exist on the
system.  Like php, it also creates the file to prevent the name from
being reused.  The default directory is process.env.TMPDIR (else /tmp),
and the default prefix is the empty string.

The tempfile is created in "wx+" O_CREAT|O_EXCL exclusive-access mode to
guarantee that it does not already exist.  The file is closed immediately
thereafter.

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


## Todo

- make callback optional, work in synchronous mode too
