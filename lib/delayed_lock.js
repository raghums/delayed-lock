/** Locks can be successfully acquired, only when the lock is in the AVAILABLE state */
var AVAILABLE = 0;

/** Once a lock is acquired, the lock is placed in the ACQUIRED state */
var ACQUIRED = 1;

/** When a lock is released, it is put in the DELAYING state for DELAY milliseconds, then it is put to AVAILABLE state */
var DELAYING = 2;

/** If there is an attempt to acquire a lock when it is not AVAILABLE, the attempt is retried after this period */
var WAIT_TIME = process.env['DELAYED_LOCK_MIN_WAIT_TIME_BETWEEN_RETRIES'] || 500;

/** The minimum period of time to wait before making the lock AVAILABLE after it is released. */
var DELAY = process.env['DELAYED_LOCK_DELAY'] || 1000;

/** If the TIMEOUT variable is not null, then lock is forcefully made available after this period in millis. */
var TIMEOUT = process.env['DELAYED_LOCK_TIMEOUT'] // ASSUMPTION: TIMEOUT (if set) > DELAY

exports.create = function (config) {
  var config = config || {};
  var waitTime = config.waitTime || +WAIT_TIME;
  var delay = config.delay || +DELAY;
  var timeout = config.timeout || +TIMEOUT;
  var lock = 0;
  var key = -1;
  var lockedAt = -1;

  var checkTimedOut = function () {
    var since = Date.now() - lockedAt;
    var ret = (timeout && !isNaN(timeout) && isFinite(timeout) && (timeout > 0) && (since > timeout));
    if (ret) lock = AVAILABLE;
    return ret;
  }

  var acquire = function (callback) {
    var generatedKey = Math.random()
    if (lock === AVAILABLE) {
      lock = ACQUIRED;
      key = generatedKey;
      lockedAt = Date.now();
      callback(generatedKey);
    } else {
      if (checkTimedOut()) {
        // Lazy release of timedout lock
        acquire(callback);
      } else {
        setTimeout(function () {
          acquire(callback);
        }, waitTime);      
      }
    }
  };

  var release = function (givenKey) {
    if (key === givenKey) {
      lock = DELAYING;
      setTimeout(function () {
        lock = AVAILABLE;
      }, delay);
    }
  };

  var status = function () {
    checkTimedOut();
    return lock;
  };

  return {
    acquire: acquire,
    release: release,
    status: status
  }
}
