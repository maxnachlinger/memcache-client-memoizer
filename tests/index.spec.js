'use strict'

const uuidv4 = require('uuid/v4')
const memoizer = require('../')

describe('index', () => {
  const cacheImpl = (initialValue = null) => {
    let cached = initialValue
    return {
      clear: () => (cached = null),
      set: (key, value) => (cached = value),
      get: () => Promise.resolve(cached)
    }
  }

  it('throws on missing input', () => {
    [
      [],
      [{}],
      {client: {}}
    ].forEach((args) => {
      expect(() => memoizer(...args)).toThrow()
    })
  })

  it('passes all fn args to keyFn', async () => {
    const client = cacheImpl()

    const keyFn = jest.fn((...args) => args.join())
    const fn = jest.fn((value) => Promise.resolve(value))

    const memoized = memoizer({client, fn, keyFn})
    expect(memoized).toBeTruthy()

    await memoized(0, 1, 2)
    expect(keyFn).toHaveBeenCalledWith(0, 1, 2)
  })

  it('calls a function not yet memoized', async () => {
    const client = cacheImpl()

    const keyFn = () => uuidv4()
    const fn = jest.fn((value) => Promise.resolve(value))

    const memoized = memoizer({client, fn, keyFn})
    expect(memoized).toBeTruthy()

    const result = await memoized('test')
    expect(fn).toHaveBeenCalled()
    expect(result).toBe('test')
  })

  it('memoizes a function and gets the next call from cache', async () => {
    const client = cacheImpl()

    const key = uuidv4()
    const keyFn = () => key
    const fn = jest.fn((value) => Promise.resolve(value))

    const memoized = memoizer({client, fn, keyFn})
    expect(memoized).toBeTruthy()

    const result0 = await memoized('test')
    expect(fn).toHaveBeenCalled()
    expect(result0).toBe('test')
    fn.mockClear()

    const result1 = await memoized('test')
    expect(fn).not.toHaveBeenCalled()
    expect(result1).toBe('test')
  })

  it('re-calls an expired memoized function', async () => {
    const client = cacheImpl()

    const key = uuidv4()
    const keyFn = () => key
    const fn = jest.fn((value) => Promise.resolve(value))

    const memoized = memoizer({client, fn, keyFn})
    expect(memoized).toBeTruthy()

    const result0 = await memoized('test')
    expect(fn).toHaveBeenCalled()
    expect(result0).toBe('test')
    fn.mockClear()

    const result1 = await memoized('test')
    expect(fn).not.toHaveBeenCalled()
    expect(result1).toBe('test')
    fn.mockClear()

    client.clear()
    const result2 = await memoized('test')
    expect(fn).toHaveBeenCalled()
    expect(result2).toBe('test')
  })

  it('calls cacheResultTransformFn with items from cache', async () => {
    const client = cacheImpl('test')
    const cacheResultTransformFn = (value) => value.toUpperCase()

    const keyFn = () => uuidv4()
    const fn = jest.fn((value) => Promise.resolve(value))

    const memoized = memoizer({client, fn, keyFn, cacheResultTransformFn})
    expect(memoized).toBeTruthy()

    const result = await memoized('test')
    expect(fn).not.toHaveBeenCalled()
    expect(result).toBe('TEST')
  })
})
