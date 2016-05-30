function CacheManger(cacheInstance, sequelize) {
  this.cacheInstance = cacheInstance;
  this.sequelize = sequelize;
}

CacheManger.prototype.set = function(key, value, ttl) {
  throw new Error('The set method wasn\'t overwritten!');
};

CacheManger.prototype.get = function(key) {
  throw new Error('The get method wasn\'t overwritten!');
};

CacheManger.prototype.del = function(key) {
  throw new Error('The del method wasn\'t overwritten!');
};

module.exports = CacheManger;
