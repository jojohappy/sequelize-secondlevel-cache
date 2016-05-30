var Redis = require('ioredis');
var CacheManager = require('./cache-manager');

var RedisCache = function(sequelize, host, port) {
  this.config = {
    host: host || '127.0.0.1',
    port: port || 6379
  };

  this.cacheInstance = new Redis(this.config);
  this.cacheManager = new CacheManager(this.cacheInstance, sequelize);
};

module.exports = RedisCache;
