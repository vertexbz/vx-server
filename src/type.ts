import * as net from 'net';
import https from 'https';
import { SyncHook } from 'tapable';
import { Application } from 'express';

interface HttpsServerOptions {
    port?: number;
}

export type HttpsOptionsType = https.ServerOptions & HttpsServerOptions;

export interface ServerOptionsType {
    host?: string,
    http: boolean | number,
    https: false | HttpsOptionsType
}

export type ServerTapsType = {
    beforeRoutes: SyncHook<Application>,
    afterRoutes: SyncHook<Application>,
    beforeStart: SyncHook<net.Server>
};

export interface ServerPluginInterface {
    http?: boolean,
    https?: boolean,
    register(taps: ServerTapsType): void
}

export type ServersType<T> = {
    http?: T,
    https?: T
};

export type RouteType = { method: string, args: Array<any> };

export type ServerInfo = ServersType<net.Server> & {
    close(): Promise<void>
};

