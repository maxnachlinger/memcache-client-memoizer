'use strict'

const uuidv4 = require('uuid/v4')
const MemcacheClient = require('memcache-client')
const memoizer = require('../')

describe('index', () => {
  let client

  afterEach(() => {
    client && client.shutdown()
  })

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
    client = new MemcacheClient({server: 'localhost:11211'})

    const keyFn = jest.fn((...args) => args.join())
    const fn = jest.fn((value) => Promise.resolve(value))

    const memoized = memoizer({client, fn, keyFn})
    expect(memoized).toBeTruthy()

    await memoized(0, 1, 2)
    expect(keyFn).toHaveBeenCalledWith(0, 1, 2)
  })

  it('calls a function not yet memoized', async () => {
    client = new MemcacheClient({server: 'localhost:11211'})

    const keyFn = () => uuidv4()
    const fn = jest.fn((value) => Promise.resolve(value))

    const memoized = memoizer({client, fn, keyFn})
    expect(memoized).toBeTruthy()

    const result = await memoized('test')
    expect(fn).toHaveBeenCalled()
    expect(result).toBe('test')
  })

  it('memoizes a function and gets the next call from cache', async () => {
    client = new MemcacheClient({server: 'localhost:11211'})

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
    client = new MemcacheClient({server: 'localhost:11211', lifetime: 1})

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

    await new Promise((resolve) => setTimeout(resolve, 1100))

    const result2 = await memoized('test')
    expect(fn).toHaveBeenCalled()
    expect(result2).toBe('test')
  })
})
