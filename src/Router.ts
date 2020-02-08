import ExpressServer, { Application } from 'express';
import * as http from 'http';
import net from 'net';
import { SyncHook } from 'tapable';
import GenericRouter from './GenericRouter';
import { RouteType, ServerPluginInterface, ServerTapsType } from './type';

export default class Router extends GenericRouter {
    protected readonly _routes: Array<RouteType> = [];
    private readonly _taps: ServerTapsType = {
        beforeRoutes: new SyncHook<Application>(['express']),
        afterRoutes: new SyncHook<Application>(['express']),
        beforeStart: new SyncHook<net.Server>(['server']) // server is http/https
    };

    protected _handle(method: keyof GenericRouter, args: any[]): void {
        this._routes.push({ method, args });
    }

    public plugin(plugin: ServerPluginInterface) {
        plugin.register(this._taps);
        return this;
    }

    protected _buildServer(express: Application, options: http.ServerOptions): net.Server {
        return http.createServer(options, express);
    }

    public build(options?: http.ServerOptions) {
        const express = ExpressServer();

        this._taps.beforeRoutes.call(express);

        for (const { method, args } of this._routes) {
            // @ts-ignore
            express[method](...args);
        }

        this._taps.afterRoutes.call(express);

        const server = this._buildServer(express, options || {});

        this._taps.beforeStart.call(server);

        return server;
    }
}
