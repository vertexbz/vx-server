import { Application } from 'express';
import * as https from 'https';
import * as net from 'net';
import Router from './Router';

export default class SecureRouter extends Router {
    protected _buildServer(express: Application, options: https.ServerOptions): net.Server {
        return https.createServer(options, express);
    }
}
