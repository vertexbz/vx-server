import CallableInstance from './callable-instance';
import { Router, IRoute, NextFunction, Request, Response } from 'express';

export default
abstract class GenericRouter extends CallableInstance implements Router {
    public constructor() {
        super('_call');
    }

    public get stack() {
        return [];
    }

    public route(prefix: string | RegExp | Array<string | RegExp>): IRoute {
        return this as unknown as IRoute;
    }

    protected abstract _handle(method: keyof GenericRouter, args: any[]): void;

    public _call(req: Request, res: Response, next: NextFunction): any;
    public _call(...args: any[]) {
        this._handle('_call', args);
        return this;
    }

    public ['m-search'](...args: any[]) {
        this._handle('m-search', args);
        return this;
    }

    public all(...args: any[]) {
        this._handle('all', args);
        return this;
    }

    public checkout(...args: any[]) {
        this._handle('checkout', args);
        return this;
    }

    public connect(...args: any[]) {
        this._handle('connect', args);
        return this;
    }

    public copy(...args: any[]) {
        this._handle('copy', args);
        return this;
    }

    public delete(...args: any[]) {
        this._handle('delete', args);
        return this;
    }

    public get(...args: any[]) {
        this._handle('get', args);
        return this;
    }

    public head(...args: any[]) {
        this._handle('head', args);
        return this;
    }

    public lock(...args: any[]) {
        this._handle('lock', args);
        return this;
    }

    public merge(...args: any[]) {
        this._handle('merge', args);
        return this;
    }

    public mkactivity(...args: any[]) {
        this._handle('mkactivity', args);
        return this;
    }

    public mkcol(...args: any[]) {
        this._handle('mkcol', args);
        return this;
    }

    public move(...args: any[]) {
        this._handle('move', args);
        return this;
    }

    public notify(...args: any[]) {
        this._handle('notify', args);
        return this;
    }

    public options(...args: any[]) {
        this._handle('options', args);
        return this;
    }

    public patch(...args: any[]) {
        this._handle('patch', args);
        return this;
    }

    public post(...args: any[]) {
        this._handle('post', args);
        return this;
    }

    public propfind(...args: any[]) {
        this._handle('propfind', args);
        return this;
    }

    public proppatch(...args: any[]) {
        this._handle('proppatch', args);
        return this;
    }

    public purge(...args: any[]) {
        this._handle('purge', args);
        return this;
    }

    public put(...args: any[]) {
        this._handle('put', args);
        return this;
    }

    public report(...args: any[]) {
        this._handle('report', args);
        return this;
    }

    public search(...args: any[]) {
        this._handle('search', args);
        return this;
    }

    public subscribe(...args: any[]) {
        this._handle('subscribe', args);
        return this;
    }

    public trace(...args: any[]) {
        this._handle('trace', args);
        return this;
    }

    public unlock(...args: any[]) {
        this._handle('unlock', args);
        return this;
    }

    public unsubscribe(...args: any[]) {
        this._handle('unsubscribe', args);
        return this;
    }

    public use(...args: any[]) {
        this._handle('use', args);
        return this;
    }

    public param(...args: any[]) {
        this._handle('param', args);
        return this;
    }
}
