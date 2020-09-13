import { NotFoundError, ActionFailedError } from './../logger/error';
import { Permission } from './../models/permission';
import express, { Router, Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { take } from 'rxjs/operators';
import { ObjectId } from 'mongodb';

import { Mission } from '../models/mission';
import { INJECTOR } from '../config/types';
import { MissionsBL } from '../bl/missions';
import { IController } from './controller.interface';
import { MissingArgumentError, InvalidArgumentError } from '../logger/error';


@injectable()
export class MissionsController implements IController {
	@inject(INJECTOR.MissionsBL) private bl: MissionsBL

	public get prefix(): string { return '/missions'; }
	public get router(): Router { return this._router; }

	private readonly _router: Router;

	constructor() {
		this._router = express.Router();

		this._router.get('/getAllMissions', (req: Request, res: Response, next: NextFunction) => {
			this.bl.getAllMissions().pipe(take(1)).subscribe({
				next: (result: Mission[]) => res.send(result), error: error => next(error)
			});
		});

		this._router.get('/getAllMissionsNames', (req: Request, res: Response, next: NextFunction) => {
			this.bl.getAllMissionsNames().pipe(take(1)).subscribe({
				next: (result: string[]) => res.send(result), error: error => next(error)
			});
		});

		this._router.get('/GetMissionById', (req: Request, res: Response, next: NextFunction) => {
			const { id } = req.query;
			if (!id) return next(new MissingArgumentError('id'));

			const _id: ObjectId = id instanceof ObjectId ? id : new ObjectId(id.toString());
			this.bl.getMissionById(_id).pipe(take(1)).subscribe({
				next: (result: Mission) => {
					if (!result) return next(new NotFoundError(`mission with id: ${_id.toHexString()}`));

					res.send(result)
				},
				error: error => next(error)
			});
		});

		this._router.post('/getMissionsByIds', (req: Request, res: Response, next: NextFunction) => {
			const { ids } = req.body;
			if (!ids) return next(new MissingArgumentError('ids'));
			if (!Array.isArray(ids) || ids.length === 0) return next(new InvalidArgumentError('ids', ids));

			const _ids: ObjectId[] = ids.map((id: string | ObjectId) => id instanceof ObjectId ? id : new ObjectId(id));
			this.bl.getMissionsByIds(_ids).pipe(take(1)).subscribe({
				next: (result: Mission[]) => res.send(result), error: error => next(error)
			});
		});

		this._router.get('/getPermissionsOfUser', (req: Request, res: Response, next: NextFunction) => {
			const { userId, missionId } = req.query;
			if (!userId) return next(new MissingArgumentError('userId'));
			if (!missionId) return next(new MissingArgumentError('missionId'));

			const _missionId = missionId instanceof ObjectId ? missionId : new ObjectId(missionId.toString());
			this.bl.getPermissionsOfUser(userId.toString(), _missionId).pipe(take(1)).subscribe({
				next: (result: Permission) => res.send(`${result}`), error: error => next(error)
			});
		});

		this._router.put('/exportMission', (req: Request, res: Response, next: NextFunction) => {
			const { missionId } = req.body;
			if (!missionId) return next(new MissingArgumentError('missionId'));

			const _missionId = missionId instanceof ObjectId ? missionId : new ObjectId(missionId);
			this.bl.exportMission(_missionId).pipe(take(1)).subscribe({
				next: (result: boolean) => {
					if (!result) return next(new ActionFailedError('export mission'));

					res.send(result)
				},
				error: error => next(error)
			});
		});

		this._router.put('/askToJoinToMission', (req: Request, res: Response, next: NextFunction) => {
			const { userId, missionId } = req.body;
			if (!userId) return next(new MissingArgumentError('userId'));
			if (!missionId) return next(new MissingArgumentError('missionId'));

			const _missionId = missionId instanceof ObjectId ? missionId : new ObjectId(missionId);
			this.bl.askToJoinToMission(userId, _missionId).pipe(take(1)).subscribe({
				next: (result: void) => res.send(result), error: error => next(error)
			});
		});

		this._router.post('/createMission', (req: Request, res: Response, next: NextFunction) => {
			const mission: Mission = req.body;

			this.bl.createMission(mission).pipe(take(1)).subscribe({
				next: (result: Mission) => res.send(result), error: error => next(error)
			});
		});

		this._router.put('/leaveMission', (req: Request, res: Response, next: NextFunction) => {
			const { userId, missionId } = req.body;
			if (!userId) return next(new MissingArgumentError('userId'));
			if (!missionId) return next(new MissingArgumentError('missionId'));

			const _missionId = missionId instanceof ObjectId ? missionId : new ObjectId(missionId);
			this.bl.leaveMission(userId, _missionId).pipe(take(1)).subscribe({
				next: (result: void) => res.send(result), error: error => next(error)
			});
		});

		this._router.post('/getAllMissionsOfUser', (req: Request, res: Response, next: NextFunction) => {
			const { userId } = req.query;
			if (!userId) return next(new MissingArgumentError('userId'));

			this.bl.getAllMissionsOfUser(userId.toString()).pipe(take(1)).subscribe({
				next: (result: Mission[]) => res.send(result), error: error => next(error)
			});
		});

		this._router.put('/updateMission', (req: Request, res: Response, next: NextFunction) => {
			const mission: Mission = req.body;
			mission._id = mission._id instanceof ObjectId ? mission._id : new ObjectId(mission._id);
			this.bl.updateMission(mission).pipe(take(1)).subscribe({
				next: (result: Mission) => res.send(result), error: error => next(error)
			});
		});
	};
}
