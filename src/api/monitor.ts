import express, { Router } from 'express';
import { IController } from './controller.interface';
import { injectable } from 'inversify';

@injectable()
export class MonitorController implements IController {
	private _router: Router;
	constructor() {
		this._router = express.Router()
			.get('/isalive', (req, res, next) => res.send(true))
			.get('/isfunctioning', (req, res, next) => res.send(test()));
	}

	public get router(): Router {
		return this._router;
	}

	public get prefix(): string {
		return '/monitor';
	}
}

const test = () => true;
