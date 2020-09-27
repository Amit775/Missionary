import { default as express, NextFunction, Request, Response, Router } from 'express';
import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';

import { API } from './api';
import { INJECTOR } from '../config/injector';
import { GroupsBL } from '../bl/groups';
import { MissingArgumentError } from '../logger/error';
import { BaseGroup, Group, UpdateableGroup } from '../models/group';


@injectable()
export class GroupsAPI implements API {
	@inject(INJECTOR.GroupsBL) private bl: GroupsBL;

	public get router(): Router { return this._router; }
	public get prefix(): string { return '/Groups'; }

	private readonly _router: Router;

	constructor() {
		this._router = express.Router();

		this.router.get('/getGroups', (request: Request, response: Response, next: NextFunction) => {
			this.bl.getGroups().subscribe({
				next: (result: Group[]) => response.send(result), error: (error: any) => next(error)
			});
		});

		this.router.get('/getGroupsOfUser', (request: Request, response: Response, next: NextFunction) => {
			const { userId } = request.query;
			if (!userId) return next(new MissingArgumentError('userId'));

			this.bl.getGroupsOfUser(userId.toString()).subscribe({
				next: (result: Group[]) => response.send(result), error: (error: any) => next(error)
			});
		});

		this.router.get('/getGroupById', (request: Request, response: Response, next: NextFunction) => {
			const { id } = request.query;
			if (!id) return next(new MissingArgumentError('id'));

			const _id: ObjectId = id instanceof ObjectId ? id : new ObjectId(id.toString());
			this.bl.getGroupById(_id).subscribe({
				next: (result: Group) => response.send(result), error: (error: any) => next(error)
			});
		});

		this.router.post('/createGroup', (request: Request, response: Response, next: NextFunction) => {
			const newGroup: BaseGroup = request.body;
			if (!newGroup.name) return next(new MissingArgumentError('name'));
			if (!newGroup.description) return next(new MissingArgumentError('description'));

			this.bl.createGroup(newGroup).subscribe({
				next: (result: Group) => response.send(result), error: (error: any) => next(error)
			});
		});

		this.router.put('/updateGroup', (request: Request, response: Response, next: NextFunction) => {
			const updatedGroup: UpdateableGroup = request.body;
			if (!updatedGroup._id) return next(new MissingArgumentError('_id'));

			this.bl.updateGroup(updatedGroup).subscribe({
				next: (result: Group) => response.send(result), error: (error: any) => next(error)
			});
		});

		this.router.put('/addUser', (request: Request, response: Response, next: NextFunction) => {
			const { userId, groupId } = request.body;
			if (!userId) return next(new MissingArgumentError('userId'));
			if (!groupId) return next(new MissingArgumentError('groupId'));

			const _groupId: ObjectId = groupId instanceof ObjectId ? groupId : new ObjectId(groupId);
			this.bl.addUser(userId, _groupId).subscribe({
				next: (result: void) => response.send(result), error: (error: any) => next(error)
			});
		});

		this.router.put('/removeUser', (request: Request, response: Response, next: NextFunction) => {
			const { userId, groupId } = request.body;
			if (!userId) return next(new MissingArgumentError('userId'));
			if (!groupId) return next(new MissingArgumentError('groupId'));

			const _groupId: ObjectId = groupId instanceof ObjectId ? groupId : new ObjectId(groupId);
			this.bl.leaveOrRemoveUser(userId, _groupId).subscribe({
				next: (result: void) => response.send(result), error: (error: any) => next(error)
			});
		});

		this.router.put('/leaveGroup', (request: Request, response: Response, next: NextFunction) => {
			const { userId, groupId } = request.body;
			if (!userId) return next(new MissingArgumentError('userId'));
			if (!groupId) return next(new MissingArgumentError('groupId'));

			const _groupId: ObjectId = groupId instanceof ObjectId ? groupId : new ObjectId(groupId);
			this.bl.leaveOrRemoveUser(userId, _groupId).subscribe({
				next: (result: void) => response.send(result), error: (error: any) => next(error)
			});
		});

		this.router.put('/askJoinGroup', (request: Request, response: Response, next: NextFunction) => {
			const { userId, groupId } = request.body;
			if (!userId) return next(new MissingArgumentError('userId'));
			if (!groupId) return next(new MissingArgumentError('groupId'));

			const _groupId: ObjectId = groupId instanceof ObjectId ? groupId : new ObjectId(groupId);
			this.bl.askJoinGroup(userId, _groupId).subscribe({
				next: (result: void) => response.send(result), error: (error: any) => next(error)
			});
		});

		this.router.put('/cancelJoinRequest', (request: Request, response: Response, next: NextFunction) => {
			const { userId, groupId } = request.body;
			if (!userId) return next(new MissingArgumentError('userId'));
			if (!groupId) return next(new MissingArgumentError('groupId'));

			const _groupId: ObjectId = groupId instanceof ObjectId ? groupId : new ObjectId(groupId);
			this.bl.cancelOrRejectJoinRequest(userId, _groupId).subscribe({
				next: (result: void) => response.send(result), error: (error: any) => next(error)
			});
		});

		this.router.put('/acceptJoinRequest', (request: Request, response: Response, next: NextFunction) => {
			const { userId, groupId } = request.body;
			if (!userId) return next(new MissingArgumentError('userId'));
			if (!groupId) return next(new MissingArgumentError('groupId'));

			const _groupId: ObjectId = groupId instanceof ObjectId ? groupId : new ObjectId(groupId);
			this.bl.addUser(userId, _groupId).subscribe({
				next: (result: void) => response.send(result), error: (error: any) => next(error)
			});
		});

		this.router.put('/rejectJoinRequest', (request: Request, response: Response, next: NextFunction) => {
			const { userId, groupId } = request.body;
			if (!userId) return next(new MissingArgumentError('userId'));
			if (!groupId) return next(new MissingArgumentError('groupId'));

			const _groupId: ObjectId = groupId instanceof ObjectId ? groupId : new ObjectId(groupId);
			this.bl.cancelOrRejectJoinRequest(userId, _groupId).subscribe({
				next: (result: void) => response.send(result), error: (error: any) => next(error)
			});
		});
	}
}
