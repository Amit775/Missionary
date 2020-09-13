import express, { Router } from 'express';
import { injectable, inject } from 'inversify';

import { IController } from './controller.interface';
import { INJECTOR } from '../config/types';
import { GroupsBL } from '../bl/groups';


@injectable()
export class GroupsController implements IController {
	@inject(INJECTOR.GroupsBL) private bl: GroupsBL;

	public get router(): Router { return this._router; }
	public get prefix(): string { return '/Groups'; }

	private readonly _router: Router;

	constructor() {
		this._router = express.Router()
			.get('/', (req, res) => res.send(this.bl.ok()));
	}
}
