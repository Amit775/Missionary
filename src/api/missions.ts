import { INJECTOR } from '../config/types';
import { inject, injectable } from 'inversify';
import express, { Router } from 'express';
import { IMissionsBL } from '../bl/missions';
import { IController } from './controller.interface';

@injectable()
export class MissionsController implements IController {
	@inject(INJECTOR.MissionsBL) private bl: IMissionsBL

	private readonly _router: Router;

	constructor() {
		this._router = express.Router()
			.get('/', (req, res, next) => {
				res.send(this.bl.getAllMissions());
			})
			.get('/', (req, res) => res.send(this.bl.ok()));
	}

	public get prefix(): string {
		return '/missions';
	}

	public get router(): Router {
		return this._router;
	}
}