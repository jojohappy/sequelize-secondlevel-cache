var _ = require('lodash');
var util = require('util');
var Promise = require('bluebird');

module.exports = function(Sequelize) {

  var Model = Sequelize.Model;

  var CacheModel = function() {
    Model.call(this);
  };

  // CacheModel only support object cache, so this will override the prototype such as
  // findById
  // findOne({
  //   where: {
  //     <primaryKey>: <id>
  //   }
  // })

  util.inherits(CacheModel, Model);

  CacheModel.prototype.findByIdWithoutCache = Model.prototype.findById;
  CacheModel.prototype.findOneWithoutCache = Model.prototype.findOne;

  CacheModel.prototype.findById = function(param, options) {
    options = _.defaults(options || {}, {
      enableCache: true
    });

    if (true === options.enableCache) {
      return this.findByIdWithCache(param, options);
    }
    else {
      return this.findByIdWithoutCache(param, options);
    }
  };

  CacheModel.prototype.findOne = function(options) {
    options = _.defaults(options || {}, {
      enableCache: true
    });

    if (true === options.enableCache) {
      return this.findOneWithCache(options);
    }
    else {
      return this.findOneWithoutCache(options);
    }
  };

  CacheModel.prototype.findByIdWithCache = function(param, options) {
    if ([null, undefined].indexOf(param) !== -1) {
      return Promise.resolve(null);
    }

    var cacheManager = this.sequelize.cacheManager;
    var self = this;

    if (typeof param !== 'number' && typeof param !== 'string' && Buffer.isBuffer(param)) {
      throw new Error('Argument passed to findById is invalid: '+param);
    }
    var key = cacheManager.key(this.getTableName(), param);
    return this.getCache(param, options)
      .catch(function(err) {
        if (err.message === 'cache not found') {
          return self.findByIdWithoutCache(param, options).then(function(res) {
            return cacheManager.set(key, res, self.options.ttl);
          });
        }
        else {
          return Promise.reject(err);
        }
      });
  };

  CacheModel.prototype.findOneWithCache = function(options) {
    if (options !== undefined && !_.isPlainObject(options)) {
      throw new Error('The argument passed to findOne must be an options object, use findById if you wish to pass a single primary key value');
    }

    var cacheManager = this.sequelize.cacheManager;
    var self = this;

    var param = options.where && options.where[this.primaryKeyAttribute];
    var key = cacheManager.key(this.getTableName(), param);
    if (param) {
      return this.getCache(param, options)
        .catch(function(err) {
          if (err.message === 'cache not found') {
            return self.findOneWithoutCache(options).then(function(res) {
              return cacheManager.set(key, res, self.options.ttl);
            });
          }
          else {
            return Promise.reject(err);
          }
        });
    }
    else {
      return this.findOneWithoutCache(options);
    }
  };

  CacheModel.prototype.formatCache = function(res) {
    var attributes = this.attributes;
    Object.keys(this.attributes).forEach(function(field) {
      var attribute = attributes[field];
      if (attribute.type instanceof Sequelize.DATE) {
        res[field] = new Date(res[field]);
      }
    });
    return res;
  };

  CacheModel.prototype.getCache = function(param, options) {
    var self = this;
    var cacheManager = this.sequelize.cacheManager;
    var key = cacheManager.key(this.getTableName(), param);
    return cacheManager.get(key)
      .then(function(res) {
        return self.build(self.formatCache(res), {
          isNewRecord: false,
          raw: true,
          attributes: Object.keys(self.tableAttributes),
          isHitCache: true
        });
      });
  };

  return CacheModel;
};
