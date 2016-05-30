var util = require('util');
var Promise = require('bluebird');
var AbstractConnectionManager = require('../abstract/cache-manager');

util.inherits(CacheManager, AbstractConnectionManager);

function CacheManager(cacheInstance, sequelize) {
  AbstractConnectionManager.call(this, cacheInstance, sequelize);
}

CacheManager.prototype.set = function(key, res, ttl) {
  this.cacheInstance.setex(key, ttl, JSON.stringify(res.get({
    plain: true
  })));
  return res;
};

CacheManager.prototype.get = function(key) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.cacheInstance.get(key, function(err, res) {
      if (err) {
        return reject(err);
      }
      if (!res) {
        return reject(new Error('cache not found'));
      }
      try {
        return resolve(JSON.parse(res));
      }
      catch(e) {
        return reject(e);
      }
    });
  });
};

CacheManager.prototype.del = function(key) {
  console.log('del cache');
};

CacheManager.prototype.key = function(modelName, id) {
  return util.format('%s/%s/%s', this.sequelize.options.cachePrefix, modelName, id.toString());
};

module.exports = CacheManager;
