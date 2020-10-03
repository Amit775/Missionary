import { default as express, NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';

import { API } from './api';
import { TRequest, validation } from '../application/middlewares/validation';
import { authRole } from '../application/middlewares/auth';
import { INJECTOR } from '../config/types';
import { GroupsBL } from '../bl/groups';
import { UserClaim } from '../models/user';
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
		this._router = express.Router()
			.get('/getGroups', this.getGroups)
			.get('/getGroupsOfUser', this.getGroupsOfUser)
			.get('/getGroupById/:id', this.getGroupById)
			.post('/createGroup', validation<BaseGroup>(['name', 'description'], false), this.createGroup)
			.put('/askJoinGroup/:id', this.askJoinGroup)
			.put('/cancelJoinRequest/:id', this.cancelJoinRequest)
			.put('/leaveGroup/:id', this.leaveGroup)

			.use(authRole(Role.ADMIN))
			.put('/updateGroup/:id', validation<BaseGroup>(['name', 'description'], false), this.updateGroup)
			.put('/addUser/:id', this.addUser)
			.put('/removeUser/:id', this.removeUser)
			.put('/acceptJoinRequest/:id', this.acceptJoinRequest)
			.put('/rejectJoinRequest/:id', this.rejectJoinRequest);
	}

	private getGroups: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		this.bl.getGroups().subscribe({
			next: (result: Group[]) => response.send(result), error: (error: any) => next(error)
		});
	};

	private getGroupsOfUser: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const currentUser: UserClaim = response.locals.currentUser;

		this.bl.getGroupsOfUser(currentUser._id).subscribe({
			next: (result: Group[]) => response.send(result), error: (error: any) => next(error)
		});
	}

	private getGroupById: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const groupId: ObjectId = new ObjectId(request.params.id);

		this.bl.getGroupById(groupId).subscribe({
			next: (result: Group) => response.send(result), error: (error: any) => next(error)
		});
	}

	private createGroup: RequestHandler = (request: TRequest<BaseGroup>, response: Response, next: NextFunction) => {
		const currentUser: UserClaim = response.locals.currentUser;

		this.bl.createGroup(request.body, currentUser._id).subscribe({
			next: (result: Group) => response.send(result), error: (error: any) => next(error)
		});
	}

	private askJoinGroup: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const groupId = new ObjectId(request.params.id);
		const currentUser: UserClaim = response.locals.currentUser;

		this.bl.askJoinGroup(currentUser._id, groupId).subscribe({
			next: (result: boolean) => {
				if (!result) return next(new ActionFailedError('askJoinGroup'));

				response.send(result);
			},
			error: (error: any) => next(error)
		});
	}

	private cancelJoinRequest: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const groupId = new ObjectId(request.params.id);
		const currentUser: UserClaim = response.locals.currentUser;

		this.bl.cancelOrRejectJoinRequest(currentUser._id, groupId).subscribe({
			next: (result: boolean) => {
				if (!result) return next(new ActionFailedError('cancelJoinRequest'));

				response.send(result);
			},
			error: (error: any) => next(error)
		});
	}

	private leaveGroup: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const groupId: ObjectId = new ObjectId(request.params.id);
		const currentUser: UserClaim = response.locals.currentUser;

		this.bl.leaveOrRemoveUser(currentUser._id, groupId).subscribe({
			next: (result: boolean) => {
				if (!result) return next(new ActionFailedError('leaveGroup'));

				response.send(result);
			},
			error: (error: any) => next(error)
		});
	}

	private updateGroup: RequestHandler = (request: TRequest<BaseGroup>, response: Response, next: NextFunction) => {
		const groupId = new ObjectId(request.params.id);

		this.bl.updateGroup(groupId, request.body).subscribe({
			next: (result: Group) => response.send(result), error: (error: any) => next(error)
		});
	}

	private addUser: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
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

	private removeUser: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
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

	private acceptJoinRequest: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
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

	private rejectJoinRequest: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
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
}
