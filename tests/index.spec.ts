import {v4} from 'uuid';
import cache from './test-cache';
import {memoizer, IMemoizerArgs} from '../index';

describe('index', () => {
	it('throws on missing input', () => {
		const args: IMemoizerArgs = {
			keyFn: (s: {}): string => s.toString(),
			fn: async (s): Promise<any> => Promise.resolve(s)
		};
		expect(() => memoizer(args)).toThrow();
	});

	it('passes all fn args to keyFn', async () => {
		const client = cache();

		const keyFn = jest.fn((...args) => args.join());
		const fn = jest.fn(async value => Promise.resolve(value));

		const memoized = memoizer({client, fn, keyFn});
		expect(memoized).toBeTruthy();

		await memoized(0, 1, 2);
		expect(keyFn).toHaveBeenCalledWith(0, 1, 2);
	});

	it('calls a function not yet memoized', async () => {
		const client = cache();

		const keyFn = v4;
		const fn = jest.fn(async value => Promise.resolve(value));

		const memoized = memoizer({client, fn, keyFn});
		expect(memoized).toBeTruthy();

		const result = await memoized('test');
		expect(fn).toHaveBeenCalled();
		expect(result).toBe('test');
	});

	it('memoizes a function and gets the next call from cache', async () => {
		const client = cache();

		const key = v4();
		const keyFn = (): string => key;
		const fn = jest.fn(async (value): Promise<any> => Promise.resolve(value));

		const memoized = memoizer({client, fn, keyFn});
		expect(memoized).toBeTruthy();

		const result0 = await memoized('test');
		expect(fn).toHaveBeenCalled();
		expect(result0).toBe('test');
		fn.mockClear();

		const result1 = await memoized('test');
		expect(fn).not.toHaveBeenCalled();
		expect(result1).toBe('test');
	});

	it('re-calls an expired memoized function', async () => {
		const client = cache();

		const key = v4();
		const keyFn = (): string => key;
		const fn = jest.fn(async (value): Promise<any> => Promise.resolve(value));

		const memoized = memoizer({client, fn, keyFn});
		expect(memoized).toBeTruthy();

		const result0 = await memoized('test');
		expect(fn).toHaveBeenCalled();
		expect(result0).toBe('test');
		fn.mockClear();

		const result1 = await memoized('test');
		expect(fn).not.toHaveBeenCalled();
		expect(result1).toBe('test');
		fn.mockClear();

		client.set(key, undefined);
		const result2 = await memoized('test');
		expect(fn).toHaveBeenCalled();
		expect(result2).toBe('test');
	});

	it('calls cacheResultTransformFn with items from cache', async () => {
		const key = v4();
		const client = cache({[key]: 'test'});
		const cacheResultTransformFn = (value: string): {} => value.toUpperCase();

		const keyFn = (): string => key;
		const fn = jest.fn(async (value): Promise<any> => Promise.resolve(value));

		const memoized = memoizer({client, fn, keyFn, cacheResultTransformFn});
		expect(memoized).toBeTruthy();

		const result = await memoized('test');
		expect(fn).not.toHaveBeenCalled();
		expect(result).toBe('TEST');
	});

	it('skips cache if skipCacheFn returns true', async () => {
		const client = {
			set: jest.fn(),
			get: jest.fn(),
		};

		const keyFn = jest.fn();
		const fn = jest.fn(async value => Promise.resolve(value));

		const memoized = memoizer({client, fn, keyFn, skipCacheFn: (): boolean => true});
		expect(memoized).toBeTruthy();

		const result = await memoized('test');
		expect(fn).toHaveBeenCalled();
		expect(result).toBe('test');
		expect(keyFn).not.toHaveBeenCalled();
		expect(client.get).not.toHaveBeenCalled();
		expect(client.set).not.toHaveBeenCalled();
	});
});
