const isFunction = require('lodash.isfunction')

const getClient = ({client, clientFn} = {}) => {
  if (!client && !clientFn) {
    throw new Error('You must pass either a client or clientFn.')
  }

  if (client && (!client.get || !client.set)) {
    throw new Error('Client should expose a get and set method.')
  }

  if (clientFn && !isFunction(clientFn)) {
    throw new Error('clientFn must be a function.')
  }

  return client || clientFn()
}

module.exports = ({client, clientFn, fn, keyFn, setOptions, cacheResultTransformFn = (x) => x} = {}) => {
  const localClient = getClient({client, clientFn})

  if ([fn, keyFn].find((value) => !isFunction(value))) {
    throw new Error('All arguments are required and should be functions')
  }

  return async (...args) => {
    const key = keyFn(...args)

    const cachedValue = await localClient.get(key)
    if (cachedValue) {
      return cacheResultTransformFn(cachedValue)
    }

    const value = await fn(...args)
    localClient.set(key, value, setOptions)
    return value
  }
}
