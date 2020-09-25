import express, { Router, Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';

import { IController } from './controller.interface';

const test = () => true;


@injectable()
export class MonitorController implements IController {
	public get router(): Router { return this._router; }
	public get prefix(): string { return '/monitor'; }

	private _router: Router;

	constructor() {
		this._router = express.Router()
			.get('/isAlive', (request: Request, response: Response, next: NextFunction) => response.send(true))
			.get('/isFunctioning', (request: Request, response: Response, next: NextFunction) => response.send(test()));
	}
}
