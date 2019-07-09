import * as net from 'net';
import https from 'https';
import { SyncHook } from 'tapable';
import { Application } from 'express';
import Server from './Server';

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

export type ArgumentTypes<T> = T extends (... args: infer U ) => infer R ? U: never;

export type ReplaceReturnType<T, TNewReturn> = (...a: ArgumentTypes<T>) => TNewReturn;

export type RouteType = { method: string, args: Array<any> };

interface ServerMethodsInterfaceBase {
    plugin(plugin: ServerPluginInterface): Server;
}

export type InheritedFromExpress = Pick<Application, 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head' | 'use'>;

export type ServerMethods<I, K extends keyof I = keyof I> = ServerMethodsInterfaceBase & { [P in K]: ReplaceReturnType<I[P], Server> };

export type ServerInfo = ServersType<net.Server> & {
    close(): Promise<void>
};

