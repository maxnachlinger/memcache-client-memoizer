import {ICacheClient} from '../index';

export default (initialValue: any = {}): ICacheClient => {
	const cache = initialValue;
	return {
		set: (key, value): void => (cache[key] = value),
		get: async (key): Promise<any> => Promise.resolve(cache[key])
	};
};
