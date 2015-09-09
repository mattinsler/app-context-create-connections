var Promise = require('bluebird');

module.exports = function(contextKey, connect) {
  return function(config) {
    var isSingle = false;
    if (typeof(config) === 'string' || config.url) {
      config = {default: config};
      isSingle = true;
    }

    config = Object.keys(config).reduce(function(o, k) {
      var v = config[k];
      if (typeof(v) === 'string') {
        o[k] = [v, {}];
      } else {
        var url = v.url;
        delete v.url;
        o[k] = [url, v];
      }
      return o;
    }, {});

    return function(context) {
      var connections = {};

      return Promise.all(
        Object.keys(config).map(function(k) {
          var v = config[k];
          return connect(v[0], v[1]).then(function(conn) {
            connections[k] = conn;
          });
        })
      ).then(function() {
        if (isSingle) {
          context[contextKey] = connections.default;
        } else {
          context[contextKey] = connections;
        }
      });
    };
  };
};
