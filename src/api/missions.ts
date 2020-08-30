import { INJECTOR } from '../config/types';
import { inject, injectable } from 'inversify';
import express, { Router } from 'express';
import { IMissionBL } from '../bl/missions';

export interface IController {
	router: Router;
	prefix: string;
}

@injectable()
export class MissionsController implements IController {
	@inject(INJECTOR.MissionsBL) private bl: IMissionBL

	private readonly _router: Router;

	constructor(
	) {
		this._router = express.Router()
			.get('/', (req, res, next) => {
				res.send(this.bl.getAllMissions());
			})
	}

	public get prefix(): string {
		return '/missions';
	}

	public get router(): Router {
		return this._router;
	}
}