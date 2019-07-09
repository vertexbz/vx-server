import { Request, Response, Application } from 'express';
import { ServerPluginInterface, ServerTapsType } from '../type';

type FallbackSig = (req: Request, res: Response) => void;

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
        super((req, res) => {
            res.writeHead(code, { Location: 'https://' + req.headers['host'] + req.url });
            res.end();
        });
    }
}

export class RedirectFallbackPlugin extends FallbackPlugin {
    constructor(location: string, code: number = 308) {
        super((req, res) => {
            res.writeHead(code, { Location: location });
            res.end();
        });
    }
}
