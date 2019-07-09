import corsMiddleware from 'cors';
import { Application } from 'express';
import { predicate } from 'vx-std';
import { ServerPluginInterface, ServerTapsType } from '../type';

export interface CorsOptions {
    credentials?: boolean;
    origin?: string | RegExp | Array<string | RegExp> | ((origin: string) => boolean) | ((origin: string) => Promise<boolean>);
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
}

const checkOrigin = (origin: string, check: string | RegExp) => {
    if (check instanceof RegExp) {
        return check.test(origin);
    }

    return origin === check;
};

export default
class CorsPlugin implements ServerPluginInterface {
    private readonly _options: corsMiddleware.CorsOptions | true;
    private readonly _path: string;

    constructor(options: CorsOptions | true);
    constructor(path: string, options: CorsOptions | true);
    constructor(...args: any) {
        const options = args.pop() || true;
        this._path = args.pop();

        this._options = {
            ...options,
            async origin(origin: string, callback) {
                let error: Error | null = new Error('Not allowed by CORS');
                if (!origin) {
                    error = null;
                } else if (predicate.isFunction(options.origin) && await options.origin(origin)) {
                    error = null;
                } else if (Array.isArray(options.origin) && options.origin.some((check: string | RegExp) => checkOrigin(origin, check))) {
                    error = null;
                } else if (checkOrigin(origin, options.origin)) {
                    error = null;
                }

                callback(error, error === null);
            }
        };
    }

    private _makeMiddleware() {
        if (this._options === true) {
            return corsMiddleware();
        }

        return corsMiddleware(this._options);
    }

    register({ beforeRoutes }: ServerTapsType) {
        beforeRoutes.tap('Cors', (express: Application) => {
            if (this._path) {
                express.use(this._path, this._makeMiddleware());
            } else {
                express.use(this._makeMiddleware());
            }
        });
    }
}
