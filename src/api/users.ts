import { default as express, Router } from 'express';
import { injectable, inject } from 'inversify';

import { API } from './api';
import { UsersBL } from '../bl/users';
import { INJECTOR } from '../config/types';


@injectable()
export class UsersAPI implements API {
	@inject(INJECTOR.UsersBL) private bl: UsersBL;

	public get router(): Router { return this._router; }
	public get prefix(): string { return '/users'; }

	private _router: Router;

	constructor() {
		this._router = express.Router()
			.get('/', (request, response) => response.send(this.bl.ok()));
	}
}
