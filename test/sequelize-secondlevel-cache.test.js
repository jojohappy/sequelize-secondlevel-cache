var should = require('should');
var Sequelize = require('sequelize');
var config = require('./config');
var SequelizeSecondlevelCache = require('../');

describe('Sequelize-secondlevel-cache', function() {
  var sequelize;
  var sequelizeException;
  var User;
  var UserGroup;

  before(function(done) {
    SequelizeSecondlevelCache(Sequelize);
    sequelize = new Sequelize('db', 'user', 'pass', {
      dialect: 'sqlite',
      logging: false
    });

    sequelizeException = new Sequelize('db', 'user', 'pass', {
      dialect: 'sqlite',
      logging: false
    });

    User = sequelize.define('user', {
      firstName: {
        type: Sequelize.STRING,
        field: 'first_name'
      },
      lastName: {
        type: Sequelize.STRING
      }
    }, {
      freezeTableName: true
    });

    UserGroup = sequelize.define('usergroup', {
      groupName: {
        type: Sequelize.STRING
      }
    });

    UserGroup.sync({force: true});

    User.sync({force: true}).then(function () {
      User.create({ firstName: 'foo', lastName: 'bar' }).then(function(user) {
        done();
      });
    });

  });

  describe('Sequelize prototype', function() {
    var sPrototype = Sequelize.prototype;

    it('should contain the method that initial cache store after using sequelize-secondlevel-cache', function(done) {
      sPrototype.initCacheStore.should.be.instanceof(Function);
      sPrototype.getCacheStore.should.be.instanceof(Function);
      done();
    });

    it('should contain the cache store after invoking initCacheStore', function(done) {
      sequelize.initCacheStore(config.redis.host, config.redis.port);
      should.exist(sequelize.cacheStore);
      should.exist(sequelize.cacheInstance);
      should.exist(sequelize.cacheManager);
      done();
    });

    it('should throw exception when use unsupport cache store', function(done) {
      (function() {
        sequelize.initCacheStore(config.redis.host, config.redis.port, {
          cacheStore: 'sqlite'
        });
      }).should.throw();
      done();
    });
  });

  describe('instance of Sequelize Model', function() {
    it('should be still a instance of Sequelize Model after invoking makeCache', function(done) {
      User.makeCache({
        ttl: 10
      });

      User.should.be.instanceof(User.sequelize.Model);
      User.findByIdWithoutCache.should.be.instanceof(Function);
      User.findOneWithoutCache.should.be.instanceof(Function);

      done();
    });

    it('should not contain the method findByIdWithoutCache and findOneWithoutCache', function(done) {
      should.not.exist(UserGroup.findByIdWithoutCache);
      should.not.exist(UserGroup.findOneWithoutCache);
      done();
    });

    it('should find record from cache', function(done) {
      User.findById(1, {
        enableCache: true
      }).then(function(user) {
        should.exist(user);
        user.should.be.instanceof(Sequelize.Instance);
        should.not.exist(user.$options.isHitCache);
        User.findOne({
          where: {
            id: 1
          },
        }).then(function(user) {
          should.exist(user);
          user.should.be.instanceof(Sequelize.Instance);
          user.$options.isHitCache.should.be.true;
          done();
        });
      });
    });
  });

});
