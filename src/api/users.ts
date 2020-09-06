import express, { Router } from 'express';
import { injectable, inject } from 'inversify';

import { IController } from './controller.interface';
import { IUsersBL } from '../bl/users';
import { INJECTOR } from '../config/types';


@injectable()
export class UsersController implements IController {
	@inject(INJECTOR.UsersBL) private bl: IUsersBL;

	public get router(): Router { return this._router; }
	public get prefix(): string { return '/users'; }

	private _router: Router;

	constructor() {
		this._router = express.Router()
			.get('/', (req, res) => res.send(this.bl.ok()));
	}
}
