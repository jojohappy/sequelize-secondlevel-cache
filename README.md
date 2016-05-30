# sequelize-secondlevel-cache

## Description

A write-through and read-through caching library, only support Sequelize 3

## Support time-series database

* Redis


## Installation

```sh
npm install sequelize-secondlevel-cache
```

## Usage

```js
var Sequelize = require('sequelize');
var SequelizeSecondlevelCache = require('sequelize-secondlevel-cache');
var config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];

SequelizeSecondlevelCache(Sequelize);
sequelize = new Sequelize('db', 'user', 'pass', {
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

User.sync({force: true}).then(function () {
  User.create({ firstName: 'foo', lastName: 'bar' });
});

sequelize.initCacheStore(config.redis.host, config.redis.port, {
  cacheStore: 'redis',
  cachePrefix: 'seq_cache'
});

User.makeCache({
  ttl: 10
});

User.findById(1, {
  enableCache: true
}).then(function(user) {
  console.log(user); // sequelize result instance
  console.log(user.$options.isHitCache);
});
```

if you want to fetch data from database directly, you should set ``` enableCache: false ```. The parameter ``` isHitCache ``` will be undefined.

## Warning

This library is desigened for object cache. Only support query below now:

##### Support

```js
Model.findById(<pkVal>)

Model.findOne({
  where: {
    <primary key>: <pkVal>
  }
})

```

##### Unsupport

```js
Model.findOne({
  where: {
    <other field>: <value>
  }
})
```

## Benchmark

##### using sqlite database directly

```
ab -n 10000 -c 500 localhost:3000
Server Hostname:        localhost
Server Port:            3000

Document Path:          /
Document Length:        106 bytes

Concurrency Level:      500
Time taken for tests:   20.815 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      3090000 bytes
HTML transferred:       1060000 bytes
Requests per second:    480.42 [#/sec] (mean)
Time per request:       1040.749 [ms] (mean)
Time per request:       2.081 [ms] (mean, across all concurrent requests)
Transfer rate:          144.97 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0  111 417.1      0    3009
Processing:    25  921 170.6    940    1274
Waiting:        6  906 170.6    922    1259
Total:         26 1032 446.1    957    3977

Percentage of the requests served within a certain time (ms)
  50%    957
  66%   1027
  75%   1064
  80%   1079
  90%   1169
  95%   1875
  98%   2107
  99%   3949
 100%   3977 (longest request)
```


##### using redis

```
ab -n 10000 -c 500 localhost:3000
Server Hostname:        localhost
Server Port:            3000

Document Path:          /
Document Length:        106 bytes

Concurrency Level:      500
Time taken for tests:   8.404 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      3090000 bytes
HTML transferred:       1060000 bytes
Requests per second:    1189.87 [#/sec] (mean)
Time per request:       420.214 [ms] (mean)
Time per request:       0.840 [ms] (mean, across all concurrent requests)
Transfer rate:          359.05 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0  124 424.2      0    3008
Processing:    21  210 100.3    198    1801
Waiting:        4  190  96.6    182    1780
Total:         21  334 452.0    199    3316

Percentage of the requests served within a certain time (ms)
  50%    199
  66%    203
  75%    233
  80%    254
  90%    451
  95%   1233
  98%   1325
  99%   3219
 100%   3316 (longest request)
```



## License

MIT