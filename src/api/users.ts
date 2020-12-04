import { default as express, NextFunction, RequestHandler, Router, Request, Response } from 'express';
import { injectable, inject } from 'inversify';

import { API } from './api';
import { UsersBL } from '../bl/users';
import { INJECTOR } from '../config/types';
import { User } from 'src/models/user';
import { ObjectId } from 'mongodb';
import { take } from 'rxjs/operators';
import { InvalidArgumentError, NotFoundError } from 'src/models/error';


@injectable()
export class UsersAPI implements API {
	@inject(INJECTOR.UsersBL) private bl: UsersBL;

	public get router(): Router { return this._router; }
	public get prefix(): string { return '/users'; }

	private _router: Router;

	constructor() {
		this._router = express.Router()
			.get('/getUserById', this.getUserById)
			.post('/getUsersByIds', this.getUsersByIds)
			.get('/getAllUsers', this.getAllUsers)
			.put('updateUserHierarchy', this.updateUserHierarchy)
			.post('/createUser', this.createUser)
	}

	private getUserById: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const userId: ObjectId = new ObjectId(request.params.id);

		this.bl.getUserById(userId, true).pipe(take(1)).subscribe({
			next: (result: User) => {
				if (!result) return next(new NotFoundError(`user with id: ${userId}`));

				response.send(result);
			},
			error: (error: any) => next(error)
		});
	}

	private getUsersByIds: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const ids: string[] = request.body.ids;
		if (!Array.isArray(ids) || ids.length === 0) return next(new InvalidArgumentError('ids', ids));

		const _ids: ObjectId[] = ids.map((id: string | ObjectId) => id instanceof ObjectId ? id : new ObjectId(id));

		this.bl.getUsersByIds(_ids, true).pipe(take(1)).subscribe({
			next: (result: User[]) => {
				if (!result || result.length === 0) return next(new NotFoundError(`users with ids: [${ids.join(', ')}]`));

				response.send(result);
			},
			error: (error: any) => next(error)
		});
	}

	private getAllUsers: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const { skip, limit } = request.query;

		this.bl.getAllUsers(skip, limit).pipe(take(1)).subscribe({
			next: (result: User[]) => {
				response.send(result);
			},
			error: (error: any) => next(error)
		});
	}

	private getUserById: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const userId: ObjectId = new ObjectId(request.params.id);

		this.bl.getUserById(userId, true).pipe(take(1)).subscribe({
			next: (result: boolean) => {
				if (!result) return next(new NotFoundError(`user with id: ${userId}`));

				response.send(result);
			},
			error: (error: any) => next(error)
		});
	}
}
