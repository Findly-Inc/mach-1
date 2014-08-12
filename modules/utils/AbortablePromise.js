var Promise = require('bluebird').Promise;

function makeAbortable(promise, abortHandler) {
  promise.abort = abortHandler;

  // Hijack promise.then so it returns an abortable promise.
  var _then = promise.then;
  promise.then = function () {
    return makeAbortable(_then.apply(promise, arguments), abortHandler);
  };

  return promise;
}

/**
 * A Promise class with an abort() method that calls the onAbort function
 * provided by the resolver.
 *
 * Example:
 *
 *   var promise = new AbortablePromise(function (resolve, reject, onAbort) {
 *     // Use resolve & reject as you normally would.
 *     var request = makeRequest( ... , function (error, response) {
 *       if (error) {
 *         reject(error);
 *       } else {
 *         resolve(response);
 *       }
 *     });
 *   
 *     // Use the onAbort function to register a callback that will
 *     // be called when promise.abort() is called. Note that it is
 *     // still your responsibility to resolve/reject as needed.
 *     onAbort(function () {
 *       request.abort();
 *       reject(new Error('Request was aborted'));
 *     });
 *   });
 *
 *   promise.abort(); // Calls the onAbort handler.
 */
function AbortablePromise(resolver) {
  var abortHandler;

  var promise = new Promise(function (resolve, reject) {
    resolver(function () {
      abortHandler = null;
      resolve.apply(this, arguments);
    }, function () {
      abortHandler = null;
      reject.apply(this, arguments);
    }, function (handler) {
      abortHandler = handler;
    });
  });

  return makeAbortable(promise, function () {
    if (abortHandler != null)
      return abortHandler.apply(this, arguments);
  });
}

module.exports = AbortablePromise;