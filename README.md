## memcache-client-memoizer

A function memoizer using a get/set cache client like [memcache-client](https://www.npmjs.com/package/memcache-client).

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

## API
`memoizer(options)`

### Arguments
* `options`: `object`. Required. An object with the following keys:
  * `client`: `{ get: (string) => Promise, set: (string, any) }`. A cache client instance, must have a `get` and `set` method. The `get` method must return a promise.
  * `clientProviderFn`: `() => client` A function which returns a `client` (defined above);
  (Either a `client` or `clientProviderFn` must be passed.)
  * `fn`: `Function`. Required. The function to memoize, must return a Promise.
  * `keyFn`: `(args to fn) => 'key-string'`. Required. A function which returns a string cache-key for memcached. This function is called with the same arguments as `fn`, allowing you to create a dynamic cache-key, for example: 
    ```javascript
    const exampleKeyFn = ({ name, color }) => `${name}:${color}`
    ```
  * `setOptions`: `object`. Optional. `memcached-client` [command options](https://www.npmjs.com/package/memcache-client#command-options).
  * `cacheResultTransformFn`. `(result-from-cache) => transformed-result`. Function to transform cache-result, defaults to `(x) => x`. This is useful if your cache service sends along the value in a different form than is returned by your `fn`.

### Note:
Rejected promises are not memoized - since that's probably not what you want :)

### memcache-client example:
```javascript
const MemcacheClient = require('memcache-client')
const memoizer = require('memcache-client-memoizer')

const fnToMemoize = ({ name, color }) => Promise.resolve({ name, color })

const memoizedFn = memoizer({
  clientProviderFn: () => new MemcacheClient({ server: 'localhost:11211' }),
  fn: fnToMemoize,
  keyFn: ({ name, color }) => `${name}:${color}`,
  cacheResultTransformFn: ({value}) => value
})

memoizedFn({name: 'Max', color: 'blue'})
  .then((result) => { ... })  // cache miss, fill cache, returns {name: 'Max', color: 'blue'}

// later on...
memoizedFn({name: 'Max', color: 'blue'})
  .then((result) => { ... })  // cache hit, returns {name: 'Max', color: 'blue'}
```
