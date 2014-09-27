# Delayed Lock [![Build Status](https://img.shields.io/travis/raghums/delayed-lock/master.svg)](https://travis-ci.org/raghums/delayed-lock)

## Installation
```bash
npm install delayed-lock --save
```

## Usage
Delayed Lock provides a Lock object that can be acquired only after a pre-configured delay after it is released. The Lock object is created as follows:

```javascript
var Lock = require('delayed-lock');
var lock = Lock.create();
```

The following APIs are available on the lock created above:

1. `acquire(callback)` - Acquire the lock. The `key` is passed to the callback of this API.
1. `release(key)` - Release the lock. The `key` got during the `acquire` call should be passed as the argument to this call. If the `key` does not match the key of the lock then this call will be a `noop`.

```javascript
/** file: test.js */
var lock = require('delayed-lock').create();

lock.acquire(function (key) {
  //do something useful
  console.log("--- 1 ---");
  lock.release(key);
})

lock.acquire(function (key) {
  // executed only after 1s delay (configurable) after the lock is released by previous call
  console.log("--- 2 ---");
  lock.release(key);
})
```
Output
```bash
$> node test.js
--- 1 ---
--- 2 ---
```
The second line (--- 2 ---) is printed after at-least after `delay` millis (1000 ms by default) after printing the first line (--- 1 ---)

The lock can be in one of the following states:

1. `AVAILABLE` A lock can be successfully acquired, only when it is in the AVAILABLE state.
1. `ACQUIRED` Once a lock is acquired, the lock is placed in the ACQUIRED state.
1. `DELAYING` When a lock is released, it is immediately put in the DELAYING state for DELAY milliseconds (configurable). After the delay it is put to AVAILABLE state.

# Delaying before unlocking
By default delay after a lock is released and before it is made available is set 1s. This can be cofigured either at a global level by setting the `DELAYED_LOCK_DELAY` environment variable or on a per-lock basis by passing a config parameter to the `create` call while creating the lock.
```javascript
var 5_sec_delayed_lock = Lock.create({delay: 5000})
```

# Configuring Locks
Delayed Locks can be configured either at a global level (affects all locks) or on a per-lock basis.

## Global configurations
Locks can be configured by setting the following environment variables *before* requiring the `delayed_lock` module for the first time.

1. `DELAYED_LOCK_DELAY` - The amount of time that the lock should be held after it is released, before making it available again. Note that this is the minimum time and not an exact time. However, it can be expected that the delay time is reasonably close to this value.
1. `DELAYED_LOCK_TIMEOUT` - If set, the lock is made available after this period of time after it is acquired or when explicitly releases by the acquirer, whichever is earlier.
1. `DELAYED_LOCK_MIN_WAIT_TIME_BETWEEN_RETRIES' - If an `acquire` call is made when the lock is not in AVAILABLE state, locking is automatically retried after 500ms. This time can be changed by setting this variable.

## Per-lock configuration
A lock can be configured by passing a (optional) configuration object to the `create` call. The following configuration parameters are available:

1. `delay` - same effect as DELAYED_LOCK_DELAY
2. `timeout` - same effect as DELAYED_LOCK_TIMEOUT
3. `waitTime` - same effect as DELAYED_LOCK_MIN_WAIT_TIME_BETWEEN_RETRIES

# Testing
```bash
$> make test
```

# Release notes:
### `0.0.1` - Initial Release

# Contributions
Pull requests are very welcome :)
