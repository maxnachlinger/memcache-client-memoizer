export type InputFunction = (...args: any[]) => Promise<any>;

export interface ICacheClient {
	get(key: string): Promise<any>;

	set(key: string, value?: any, options?: any): any;
}

export type ICacheClientProvider = () => ICacheClient;

export interface IMemoizerArgs {
	readonly client?: ICacheClient;
	readonly clientProviderFn?: ICacheClientProvider;
	readonly fn: InputFunction;

	keyFn(...args: any[]): string;

	readonly setOptions?: any;

	cacheResultTransformFn?(arg: any): any;
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
	const {client, clientProviderFn, fn, keyFn, setOptions = {}, cacheResultTransformFn = (x: any) => x} = args;
	const localClient = getClient(client, clientProviderFn);

	if (!fn || !keyFn) {
		throw new Error('You must pass both a fn and a keyFn.');
	}

	return async (...fnArgs) => {
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
