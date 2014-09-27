var should = require('chai').should();
var delay = '2000'; //ms
process.env['DELAYED_LOCK_DELAY'] = delay;
process.env['DELAYED_LOCK_TIMEOUT'] = null; // Don't want timeouts by default
var Lock = require('../lib/delayed_lock');

describe('DelayedLock', function () {
  it('Should delay execution', function (done) {
    var dl = Lock.create();
    var firstLockReleaseTime = 0;
    dl.acquire(function (key) {
      firstLockReleaseTime = Date.now();
      dl.release(key);   
    });
    dl.acquire(function (key) {
      var now = Date.now();
      var diff = now - firstLockReleaseTime;
      (diff > +delay).should.equal(true);
      dl.release(key);
      done();
    })
  });

  it('Should timeout properly', function (done) {
    var timeout = +delay + 1000; 
    var dl = Lock.create({timeout: timeout});

    var firstLockAcquireTime = 0;
    var firstLockWorkingTime = timeout * 5;
    dl.acquire(function (key){
      firstLockAcquireTime = Date.now();
      setTimeout(function() {dl.release(key);}, firstLockWorkingTime);
    });

    dl.acquire(function (key) {
      var now = Date.now();
      var diff = now - firstLockAcquireTime;
      (diff > timeout).should.equal(true);
      (diff < firstLockWorkingTime).should.equal(true);
      done();
    })
  });
})