const isFunction = require('lodash.isfunction')

module.exports = ({ client, fn, keyFn, setOptions } = {}) => {
  if (!client || client.constructor.name !== 'MemcacheClient' || !client.get || !client.set) {
    throw new Error('All arguments are required')
  }

  if ([fn, keyFn].find((value) => !isFunction(value))) {
    throw new Error('All arguments are required and should be functions')
  }

  return (...args) => {
    const key = keyFn(...args)

    return client.get(key)
      .then(({ value } = {}) => {
        if (value) {
          return Promise.resolve(value)
        }

        return fn(...args)
          .then((result) => {
            client.set(key, result, setOptions)
            return Promise.resolve(result)
          })
      })
  }
}
