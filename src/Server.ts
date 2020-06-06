import * as net from 'net';
import { predicate } from 'vx-std';
import * as plugin from './plugin';
import { ServerOptionsType, ServerInfo, ServerPluginInterface } from './type';
import Router from './Router';
import GenericRouter from './GenericRouter';
import SecureRouter from './SecureRouter';

export default class Server extends GenericRouter {
    private static readonly defaultOptions: ServerOptionsType = {
        host: '0.0.0.0',
        http: true,
        https: false
    };

    public static readonly plugin = plugin;

    public static startupNotice({ http, https}: ServerInfo) {
        console.log('🚀 Server ready');
        if (http) {
            const address = http.address() as net.AddressInfo;
            console.log(`🔓 HTTP running on: http://${address.address}:${address.port}/`);
        }
        if (https) {
            const address = https.address() as net.AddressInfo;
            console.log(`🔒 HTTPS running on: https://${address.address}:${address.port}/`);
        }
    }

    protected readonly _options: ServerOptionsType;

    protected _current: any;

    public readonly http!: Router;
    public readonly https!: Router;

    public constructor(options?: ServerOptionsType) {
        super();
        this._options = { ...(this.constructor as typeof Server).defaultOptions, ...options };

        if (this._options.http) {
            this.http = new Router();
        }

        if (this._options.https) {
            this.https = new SecureRouter();
        }
    }

    public get main(): Router {
        return this.https || this.http;
    }

    public async start(): Promise<ServerInfo> {
        if (!this._current) {
            this._current = await this._start();
        }

        return Promise.resolve(this._current);
    }

    public stop() {
        if (this._current) {
            return this._current.close();
        }

        return Promise.resolve();
    }

    public plugin(plugin: ServerPluginInterface) {
        if (plugin.http !== false) {
            this.http?.plugin(plugin);
        }
        if (plugin.https !== false) {
            this.https?.plugin(plugin);
        }
        return this;
    }

    protected _listen<S extends net.Server>(server: S, port: number, host: string): Promise<S> {
        return new Promise((res) => {
            server.once('listening', () => res(server));
            server.listen(port, host);
        });
    }

    protected _close<S extends net.Server>(server: S): Promise<void> {
        return new Promise((res, rej) => {
            server.close((err) => err ? rej(err) : res());
        });
    }

    protected async _start() {
        const httpPort = this._options.http && (predicate.isNumber(this._options.http) ? this._options.http : 80);
        const httpsPort = this._options.https && (predicate.isNumber(this._options.https.port) ? this._options.https.port : 443);
        const host = this._options.host as string;
        const [http, https] = await Promise.all([
            this.http && this._listen(this.http.build(), httpPort as number, host),
            this.https && this._listen(this.https?.build(this._options.https as any), httpsPort as number, host),
        ]);

        const self = this;

        return {
            http,
            https,
            async close() {
                await Promise.all([
                    self.http && self._close(http),
                    self.https && self._close(https),
                ]);
                self._current = undefined;
            }
        };
    }

    protected _handle(method: keyof GenericRouter, args: any[]): void {
        // @ts-ignore
        this.http?.[method](...args);
        // @ts-ignore
        this.https?.[method](...args);
    }
}
