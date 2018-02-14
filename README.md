## memcache-client-memoizer

A function memoizer using [memcache-client](https://www.npmjs.com/package/memcache-client).

[![travis][travis-image]][travis-url]
[![npm][npm-image]][npm-url]

[travis-image]: https://travis-ci.org/maxnachlinger/memcache-client-memoizer.svg?branch=master
[travis-url]: https://travis-ci.org/maxnachlinger/memcache-client-memoizer
[npm-image]: https://img.shields.io/npm/v/memcache-client-memoizer.svg?style=flat
[npm-url]: https://npmjs.org/package/memcache-client-memoizer

Install:
```shell
npm i memcache-client-memoizer
```

## Note:
Rejected promises and callbacks called with an `err` argument are not memoized, since that's a pretty bad idea :)

## Promise Memoization
`memoizer(options)`

### Arguments
* `options`: `object`. Required. An object with the following keys:
  * `client`: `memcache-client instance`. Required. A [memcache-client](https://www.npmjs.com/package/memcache-client) instance.
  * `fn`: `Function`. Required. The function to memoize, must return a Promise.
  * `keyFn`: `(args to fn) => 'key-string'`. Required. A function which returns a string cache-key for memcached. This 
  function is called with the same arguments as `fn`, allowing you to create a dynamic cache-key, for example: 
```javascript
  const exampleKeyFn = ({ name, color }) => `${name}:${color}`
```

### Example:
```javascript
const MemcacheClient = require('memcache-client')
const memoizer = require('memcache-client-memoizer')

const client = new MemcacheClient({ server: 'localhost:11211' })
const fnToMemoize = ({ name, color }) => Promise.resolve(input)

const memoizedFn = memoizer({
  client,
  fn: fnToMemoize,
  keyFn: ({ name, color }) => `${name}:${color}`
})

memoizedFn({name: 'Max', color: 'blue'})
  .then((result) => { ... })  // cache miss, fill cache, returns {name: 'Max', color: 'blue'}

// later on...
memoizedFn({name: 'Max', color: 'blue'})
  .then((result) => { ... })  // cache hit, returns {name: 'Max', color: 'blue'}
```
