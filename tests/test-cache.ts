import {ICacheClient} from '../index';

export default (initialValue: any = {}): ICacheClient => {
	const cache = initialValue;
	return {
		set: (key, value) => (cache[key] = value),
		get: async key => Promise.resolve(cache[key])
	};
};
