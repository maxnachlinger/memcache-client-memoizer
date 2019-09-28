export type InputFunction = (...args: any[]) => Promise<any>;

export interface ICacheClient {
	get(key: any): Promise<any>;

	set(key: any, value?: any, options?: any): any;
}

export type ICacheClientProvider = () => ICacheClient;

export interface IMemoizerArgs {
	readonly client?: ICacheClient;
	readonly clientProviderFn?: ICacheClientProvider;
	readonly fn: InputFunction;
	readonly setOptions?: any;

	keyFn(...args: any[]): string;

	cacheResultTransformFn?(arg: any): any;

	skipCacheFn?(...args: any[]): boolean;
}

const getClient = (client?: ICacheClient, clientProviderFn?: ICacheClientProvider): ICacheClient => {
	if (client) {
		return client;
	}
	if (clientProviderFn) {
		return clientProviderFn();
	}
	throw new Error('You must pass either a client or clientProviderFn.');
};

const memoizer = (args: IMemoizerArgs): InputFunction => {
	const {client, clientProviderFn, fn, keyFn, setOptions = {}, cacheResultTransformFn = (x: {}): {} => x, skipCacheFn = (): boolean => false} = args;
	const localClient = getClient(client, clientProviderFn);

	if (!fn || !keyFn) {
		throw new Error('You must pass both a fn and a keyFn.');
	}

	return async (...fnArgs): Promise<any> => {
		if (skipCacheFn(...fnArgs)) {
			return fn(...fnArgs);
		}

		const key = keyFn(...fnArgs);

		const cachedValue = await localClient.get(key);
		if (cachedValue) {
			return cacheResultTransformFn(cachedValue);
		}

		const value = await fn(...fnArgs);
		localClient.set(key, value, setOptions);
		return value;
	};
};

export {memoizer};
