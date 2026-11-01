import { Endpoint, HttpMethod } from '../types/enums';

export type UrlOptions = Partial<Record<'apiKey' | 'sources', string>>;

export type Callback<T> = (data: T) => void;

export interface RequestParams {
    endpoint: Endpoint;
    options?: UrlOptions;
}

class Loader {
    private readonly baseLink: string;
    private readonly options: UrlOptions;

    constructor(baseLink: string, options: UrlOptions) {
        this.baseLink = baseLink;
        this.options = options;
    }

    public getResp<T>(
        { endpoint, options = {} }: RequestParams,
        callback: Callback<T> = () => {
            console.error('No callback for GET response');
        }
    ): void {
        this.load<T>(HttpMethod.Get, endpoint, callback, options);
    }

    private errorHandler(res: Response): Response {
        if (!res.ok) {
            if (res.status === 401 || res.status === 404)
                console.log(`Sorry, but there is ${res.status} error: ${res.statusText}`);
            throw Error(res.statusText);
        }

        return res;
    }

    private makeUrl(options: UrlOptions, endpoint: Endpoint): string {
        const urlOptions: UrlOptions = { ...this.options, ...options };
        let url = `${this.baseLink}${endpoint}?`;

        Object.entries(urlOptions).forEach(([key, value]) => {
            url += `${key}=${value}&`;
        });

        return url.slice(0, -1);
    }

    private load<T>(method: HttpMethod, endpoint: Endpoint, callback: Callback<T>, options: UrlOptions = {}): void {
        fetch(this.makeUrl(options, endpoint), { method })
            .then(this.errorHandler)
            .then((res): Promise<T> => res.json())
            .then((data) => callback(data))
            .catch((err) => console.error(err));
    }
}

export default Loader;
