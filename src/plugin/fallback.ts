import { Request, Response, Application } from 'express';
import { ServerPluginInterface, ServerTapsType } from '../type';

type FallbackSig = ((req: Request, res: Response) => void) | ((err: any, req: any, res: any, next: any) => void);

export default
class FallbackPlugin implements ServerPluginInterface {
    private readonly _fallback: FallbackSig;

    constructor(fallback: FallbackSig) {
        this._fallback = fallback;
    }

    register({ afterRoutes }: ServerTapsType) {
        afterRoutes.tap('Fallback', (express: Application) => {
            express.use(this._fallback);
        });
    }
}

export class HttpsFallbackPlugin extends FallbackPlugin {
    get http() {
        return true;
    }

    get https() {
        return false;
    }

    constructor(code: number = 308) {
        super((req: any, res: any) => {
            res.writeHead(code, { Location: 'https://' + req.headers['host'] + req.url });
            res.end();
        });
    }
}

export class RedirectFallbackPlugin extends FallbackPlugin {
    constructor(location: string, code: number = 308) {
        super((req: any, res: any) => {
            res.writeHead(code, { Location: location });
            res.end();
        });
    }
}

interface ErrorFallbackPluginOptions {
    logger?: (msg: string) => void
}

export class ErrorFallbackPlugin extends FallbackPlugin {
    protected readonly _options: ErrorFallbackPluginOptions;

    constructor(options?: ErrorFallbackPluginOptions) {
        super((err: any, req: any, res: any, next: any) => {
            if (err) {
                this.handle(err, req, res);
            } else {
                next();
            }
        });

        this._options = {
            logger: console.error.bind(console),
            ...options
        }
    }

    handle(err: any, req: Request, res: Response) {
        this._options.logger!(err);
        res.status(500).send();
    }
}
