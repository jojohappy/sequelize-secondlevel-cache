var _ = require('lodash');

module.exports = function(Sequelize) {
  if (!Sequelize) {
    Sequelize = require('sequelize');
  }

  Sequelize.prototype.initCacheStore = Sequelize.initCacheStore = function(host, port, options) {
    this.options = _.extend(this.options, _.defaults(options || {}, {
      cacheStore: 'redis',
      cachePrefix: 'seq_cache',
    }));

    var cacheStore;
    if (this.options.cacheStore === 'redis') {
      cacheStore = require('./cache/redis');
    }
    else {
      throw new Error('The cache store ' + this.getCacheStore() + ' is not supported. Supported cache: redis.');
    }
    this.cacheStore = new cacheStore(this, host, port);
    this.cacheInstance = this.cacheStore.cacheInstance;
    this.cacheManager = this.cacheStore.cacheManager;
  };

  Sequelize.prototype.getCacheStore = function() {
    return this.options.cacheStore;
  };

  Sequelize.Model.prototype.makeCache = function(options) {
    var CacheModel = require('./cache-model')(Sequelize);
    options = _.extend({
      ttl: 10
    }, options || {});

    this.options = _.extend(this.options, options);

    Object.setPrototypeOf(this, CacheModel.prototype);
  };
};
