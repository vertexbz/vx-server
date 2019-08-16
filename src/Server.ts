import * as net from 'net';
import http from 'http';
import https from 'https';
import express, { Application } from 'express';
import { SyncHook } from 'tapable';
import { predicate } from 'vx-std';
import { listenPromise, closePromise, buildServerMethods } from './utils';
import * as plugin from './plugin';
import {
    ServerOptionsType,
    ServerTapsType,
    ServersType,
    RouteType,
    ArgumentTypes,
    InheritedFromExpress,
    ServerMethods,
    ServerInfo,
    ServerPluginInterface
} from './type';
import { AddressInfo } from "net";

type MethodsInterface = ServerMethods<InheritedFromExpress>;

export default class Server implements MethodsInterface {
    private static readonly defaultOptions: ServerOptionsType = {
        host: '0.0.0.0',
        http: true,
        https: false
    };

    private static makeTaps(): ServerTapsType {
        return {
            beforeRoutes: new SyncHook<Application>(['express']),
            afterRoutes: new SyncHook<Application>(['express']),
            beforeStart: new SyncHook<net.Server>(['server']) // server is http/https
        };
    }

    public static readonly plugin = plugin;

    public static startupNotice({ http, https}: ServerInfo) {
        console.log('🚀 Server ready');
        if (http) {
            const address = http.address() as AddressInfo;
            console.log(`🔓 HTTP running on: http://${address.address}:${address.port}/`);
        }
        if (https) {
            const address = https.address() as AddressInfo;
            console.log(`🔒 HTTPS running on: https://${address.address}:${address.port}/`);
        }
    }

    private readonly _options: ServerOptionsType;
    private readonly _taps: ServersType<ServerTapsType>;
    private readonly _routes: ServersType<Array<RouteType>>;

    private _current: any;

    public readonly http!: MethodsInterface;
    public readonly https!: MethodsInterface;

    constructor(options?: ServerOptionsType) {
        this._options = { ...(this.constructor as typeof Server).defaultOptions, ...options };

        this._taps = {};
        this._routes = {};


        if (this._options.http) {
            this._routes.http = [];
            this._taps.http = (this.constructor as typeof Server).makeTaps();
            this.http = buildServerMethods(this._routes.http, this._taps.http, this);
        }

        if (this._options.https) {
            this._routes.https = [];
            this._taps.https = (this.constructor as typeof Server).makeTaps();
            this.https = buildServerMethods(this._routes.https, this._taps.https, this);
        }
    }

    private _makeExpress(): ServersType<Application> {
        const result: ServersType<Application> = {};
        if (this._options.http) {
            result.http = express();
        }

        if (this._options.https) {
            result.https = express();
        }
        return result;
    }

    private _makeServers(express: ServersType<Application>) {
        const result: ServersType<net.Server> = {};
        if (express.http && this._options.http) {
            result.http = http.createServer(express.http);
        }
        if (express.https && this._options.https) {
            const { port, ...options } = this._options.https;
            result.https = https.createServer(options, express.https);
        }
        return result;
    }

    private _callTap<T extends keyof ServerTapsType>(tap: T, arg: ServersType<ArgumentTypes<ServerTapsType[T]['call']>[0]>) {
        for (const [name, taps] of Object.entries(this._taps)) {
            if (taps && tap in taps) {
                // @ts-ignore
                taps[tap].call(arg[name]);
            }
        }
    }

    private async _start() {
        const express = this._makeExpress();

        this._callTap('beforeRoutes', express);

        for (const [variant, routes] of Object.entries(this._routes)) {
            if (routes) {
                for (const { method, args } of routes) {
                    // @ts-ignore
                    express[variant][method](...args);
                }
            }
        }

        this._callTap('afterRoutes', express);

        const servers = this._makeServers(express);

        this._callTap('beforeStart', servers);


        const [http, https] = await Promise.all([
            listenPromise(servers.http, predicate.isNumber(this._options.http) ? this._options.http : 80, this._options.host),
            listenPromise(servers.https, this._options.https && predicate.isNumber(this._options.https.port) ? this._options.https.port : 443, this._options.host),
        ]);

        const self = this;

        return {
            http,
            https,
            async close() {
                const awaiters: Array<Promise<any>> = [];

                if (http) {
                    awaiters.push(closePromise(http));
                }
                if (https) {
                    awaiters.push(closePromise(https));
                }

                await Promise.all(awaiters);
                self._current = undefined;
            }
        };
    }

    async start(): Promise<ServerInfo> {
        if (!this._current) {
            this._current = await this._start();

        }

        return Promise.resolve(this._current);
    }

    stop() {
        if (this._current) {
            return this._current.close();
        }

        return Promise.resolve();
    }

    all(...args: any) {
        this.http && this.http.all.apply(null, args);
        this.https && this.https.all.apply(null, args);
        return this;
    }

    get(...args: any) {
        this.http && this.http.get.apply(null, args);
        this.https && this.https.get.apply(null, args);
        return this;
    }

    post(...args: any) {
        this.http && this.http.post.apply(null, args);
        this.https && this.https.post.apply(null, args);
        return this;
    }

    put(...args: any) {
        this.http && this.http.put.apply(null, args);
        this.https && this.https.put.apply(null, args);
        return this;
    }

    delete(...args: any) {
        this.http && this.http.delete.apply(null, args);
        this.https && this.https.delete.apply(null, args);
        return this;
    }

    patch(...args: any) {
        this.http && this.http.patch.apply(null, args);
        this.https && this.https.patch.apply(null, args);
        return this;
    }

    options(...args: any) {
        this.http && this.http.options.apply(null, args);
        this.https && this.https.options.apply(null, args);
        return this;
    }

    head(...args: any) {
        this.http && this.http.head.apply(null, args);
        this.https && this.https.head.apply(null, args);
        return this;
    }

    use(...args: any) {
        this.http && this.http.use.apply(null, args);
        this.https && this.https.use.apply(null, args);
        return this;
    }

    plugin(plugin: ServerPluginInterface) {
        this.http && plugin.http !== false && this.http.plugin(plugin);
        this.https && plugin.https !== false && this.https.plugin(plugin);
        return this;
    }
}
