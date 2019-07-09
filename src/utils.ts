import * as net from 'net';
import { Application } from 'express';
import { ArgumentTypes, InheritedFromExpress, RouteType, ServerMethods, ServerPluginInterface, ServerTapsType } from './type';
import Server from './Server';


export const listenPromise = (server: net.Server | void | null, port: number, host?: string): Promise<net.Server | void> => {
    if (server) {
        return new Promise((res) => {
            server.once('listening', () => res(server));
            server.listen(port, host);
        });
    }

    return Promise.resolve();
};

export const closePromise = (server: net.Server | void | null) =>{
    if (server) {
        return new Promise((res, rej) => {
            server.close((err) => err ? rej(err) : res());
        });
    }

    return Promise.resolve();
};

const inheritedFromExpress: Array<keyof InheritedFromExpress> = ['all', 'get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'use'];

export const buildServerMethods = <O extends InheritedFromExpress, K extends keyof InheritedFromExpress>
(routes: Array<RouteType>, taps: ServerTapsType, self: Server): ServerMethods<O> => {
    // @ts-ignore
    const inherited = inheritedFromExpress.reduce((acc: O, method: K) => {
        // @ts-ignore
        acc[method] = (...args: ArgumentTypes<Application[K]>) => {
            routes.push({ method, args });
            return self;
        };

        return acc;
    }, ({} as O));

    return Object.assign(inherited, {
        plugin(plugin: ServerPluginInterface) {
            plugin.register(taps);
            return self;
        }
    });
};
