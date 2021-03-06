var Connection = require('../Connection');

/**
 * Creates a new Connection using the given options and sends
 * the request to the given app. Returns a promise for the connection
 * object when the response is received.
 *
 * Options may be any of the Connection options, plus the following:
 *
 * - binary     By default the response content is buffered and stored
 *              in the responseText property of the connection. Set this
 *              option true to disable this behavior.
 * - maxLength  The maximum length of the response content to accept.
 *              This option has no effect when "binary" is true. By
 *              default there is no maximum length.
 * - encoding   The encoding to use to decode the response body. This
 *              option has no effect when "binary" is true. By default
 *              the encoding is whatever was specified in the Content-Type
 *              header of the response.
 *
 * If a callback is provided, it will be called with the Connection
 * object before the request is made.
 */
function callApp(app, options, callback) {
  options = options || {};

  var conn = new Connection(options);

  if (callback)
    callback(conn);

  return conn.call(app).then(function () {
    if (options.binary)
      return conn;

    return conn.response.stringifyContent(options.maxLength, options.encoding).then(function (content) {
      conn.responseText = content;
      return conn;
    });
  });
}

module.exports = callApp;
