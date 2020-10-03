import { default as express, NextFunction, Request, Response, Router } from 'express';
import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';

import { API } from './api';
import { TRequest, validation } from '../application/middlewares/validation';
import { gauthorization } from '../application/middlewares/auth';
import { INJECTOR } from '../config/types';
import { GroupsBL } from '../bl/groups';
import { User } from '../models/user';
import { Role } from '../models/permission';
import { BaseGroup, Group } from '../models/group';
import { ActionFailedError, MissingArgumentError } from '../models/error';


@injectable()
export class GroupsAPI implements API {
	@inject(INJECTOR.GroupsBL) private bl: GroupsBL;

	public get router(): Router { return this._router; }
	public get prefix(): string { return '/Groups'; }

	private readonly _router: Router;

	constructor() {
		this._router = express.Router();

		this.router.get('/getGroups',
			(request: Request, response: Response, next: NextFunction) => {
				this.bl.getGroups().subscribe({
					next: (result: Group[]) => response.send(result), error: (error: any) => next(error)
				});
			}
		);

		this.router.get('/getGroupsOfUser',
			(request: Request, response: Response, next: NextFunction) => {
				const currentUser: User = response.locals.currentUser;

				this.bl.getGroupsOfUser(currentUser._id).subscribe({
					next: (result: Group[]) => response.send(result), error: (error: any) => next(error)
				});
			}
		);

		this.router.get('/getGroupById/:id',
			(request: Request, response: Response, next: NextFunction) => {
				const groupId: ObjectId = new ObjectId(request.params.id);

				this.bl.getGroupById(groupId).subscribe({
					next: (result: Group) => response.send(result), error: (error: any) => next(error)
				});
			}
		);

		this.router.post('/createGroup',
			validation(['name', 'description'], false),
			(request: TRequest<BaseGroup>, response: Response, next: NextFunction) => {
				const currentUser: User = response.locals.currentUser;


				this.bl.createGroup(request.body, currentUser).subscribe({
					next: (result: Group) => response.send(result), error: (error: any) => next(error)
				});
			}
		);

		this.router.put('/askJoinGroup/:id',
			(request: Request, response: Response, next: NextFunction) => {
				const groupId = new ObjectId(request.params.id);
				const currentUser: User = response.locals.currentUser;

				this.bl.askJoinGroup(currentUser._id, groupId).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('askJoinGroup'));

						response.send(result);
					},
					error: (error: any) => next(error)
				});
			}
		);

		this.router.put('/cancelJoinRequest/:id',
			(request: Request, response: Response, next: NextFunction) => {
				const groupId = new ObjectId(request.params.id);
				const currentUser: User = response.locals.currentUser;

				this.bl.cancelOrRejectJoinRequest(currentUser._id, groupId).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('cancelJoinRequest'));

						response.send(result);
					},
					error: (error: any) => next(error)
				});
			}
		);

		this.router.put('/leaveGroup/:id',
			(request: Request, response: Response, next: NextFunction) => {
				const groupId: ObjectId = new ObjectId(request.params.id);
				const currentUser: User = response.locals.currentUser;

				this.bl.leaveOrRemoveUser(currentUser._id, groupId).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('leaveGroup'));

						response.send(result);
					},
					error: (error: any) => next(error)
				});
			}
		);


		this.router.put('/updateGroup/:id',
			validation<BaseGroup>(['name', 'description'], false),
			gauthorization(Role.ADMIN), (request: TRequest<BaseGroup>,
				response: Response, next: NextFunction) => {
			const groupId = new ObjectId(request.params.id);

			this.bl.updateGroup(groupId, request.body).subscribe({
				next: (result: Group) => response.send(result), error: (error: any) => next(error)
			});
		}
		);

		this.router.put('/addUser/:id',
			gauthorization(Role.ADMIN),
			(request: Request, response: Response, next: NextFunction) => {
				const groupId = new ObjectId(request.params.id);
				const { userId } = request.body;

				if (!userId) return next(new MissingArgumentError('userId'));

				this.bl.addUser(userId, groupId).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('addUser'));

						response.send(result);
					},
					error: (error: any) => next(error)
				});
			}
		);

		this.router.put('/removeUser/:id',
			gauthorization(Role.ADMIN),
			(request: Request, response: Response, next: NextFunction) => {
				const groupId = new ObjectId(request.params.id);
				const { userId } = request.body;

				if (!userId) return next(new MissingArgumentError('userId'));

				this.bl.leaveOrRemoveUser(userId, groupId).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('removeUser'));

						response.send(result);
					},
					error: (error: any) => next(error)
				});
			}
		);

		this.router.put('/acceptJoinRequest/:id',
			gauthorization(Role.ADMIN),
			(request: Request, response: Response, next: NextFunction) => {
				const groupId = new ObjectId(request.params.id);
				const { userId } = request.body;

				if (!userId) return next(new MissingArgumentError('userId'));

				this.bl.addUser(userId, groupId).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('acceptJoinRequest'));

						response.send(result);
					},
					error: (error: any) => next(error)
				});
			}
		);

		this.router.put('/rejectJoinRequest/:id',
			gauthorization(Role.ADMIN),
			(request: Request, response: Response, next: NextFunction) => {
				const groupId = new ObjectId(request.params.id);
				const { userId } = request.body;

				if (!userId) return next(new MissingArgumentError('userId'));

				this.bl.cancelOrRejectJoinRequest(userId, groupId).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('rejectJoinRequest'));

						response.send(result);
					},
					error: (error: any) => next(error)
				});
			}
		);
	}
}
