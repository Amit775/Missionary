import express, { Router } from 'express';
import { IController } from './controller.interface';
import { injectable, inject } from "inversify";
import { INJECTOR } from '../config/types';
import { IGroupsBL } from '../bl/groups';

@injectable()
export class GroupsController implements IController {
	@inject(INJECTOR.GroupsBL) private bl: IGroupsBL;
	private _router: Router;
	constructor() {
		this._router = express.Router()
			.get('/', (req, res) => res.send(this.bl.ok()));
	}

	public get router(): Router {
		return this._router;
	}

	public get prefix(): string {
		return '/Groups';
	}
}