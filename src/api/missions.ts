import { take } from 'rxjs/operators';
import express, { Router, Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';

import { Mission } from '../models/mission';
import { INJECTOR } from '../config/types';
import { IMissionsBL } from '../bl/missions';
import { IController } from './controller.interface';
import { ObjectId } from 'mongodb';

@injectable()
export class MissionsController implements IController {
	@inject(INJECTOR.MissionsBL) private bl: IMissionsBL

	public get prefix(): string { return '/missions'; }
	public get router(): Router { return this._router; }

	private readonly _router: Router;

	constructor() {
		this._router = express.Router();

		this._router.get('/getAllMissions', (req: Request, res: Response, next: NextFunction) => {
			this.bl.getAllMissions().pipe(take(1)).subscribe({
				next: result => res.send(result), error: error => next(error)
			});
		});

		this._router.get('/getAllMissionsNames', (req: Request, res: Response, next: NextFunction) => {
			this.bl.getAllMissionsNames().pipe(take(1)).subscribe({
				next: result => res.send(result), error: error => next(error)
			});
		});

		this._router.post('/getMissionById', (req: Request, res: Response, next: NextFunction) => {
			const { id } = req.body;
			const _id: ObjectId = id instanceof ObjectId ? id : new ObjectId(id);
			this.bl.getMissionById(_id).pipe(take(1)).subscribe({
				next: result => res.send(result), error: error => next(error)
			});
		});

		this._router.post('/getMissionsByIds', (req: Request, res: Response, next: NextFunction) => {
			const { ids } = req.body;
			const _ids: ObjectId[] = ids.map((id: string | ObjectId) => id instanceof ObjectId ? id : new ObjectId(id));
			this.bl.getMissionsByIds(..._ids).pipe(take(1)).subscribe({
				next: result => res.send(result), error: error => next(error)
			});
		});

		this._router.post('/getPermissionsOfUser', (req: Request, res: Response, next: NextFunction) => {
			const { userId, missionId } = req.body;
			const _missionId = missionId instanceof ObjectId ? missionId : new ObjectId(missionId);
			this.bl.getPermissionsOfUser(userId, _missionId).pipe(take(1)).subscribe({
				next: result => res.send(`${result}`), error: error => next(error)
			});
		});

		this._router.put('/exportMission', (req: Request, res: Response, next: NextFunction) => {
			const { missionId } = req.body;
			const _missionId = missionId instanceof ObjectId ? missionId : new ObjectId(missionId);
			this.bl.exportMission(_missionId).pipe(take(1)).subscribe({
				next: result => res.send(result), error: error => next(error)
			});
		});

		this._router.put('/askToJoinToMission', (req: Request, res: Response, next: NextFunction) => {
			const { userId, missionId } = req.body;
			const _missionId = missionId instanceof ObjectId ? missionId : new ObjectId(missionId);
			this.bl.askToJoinToMission(userId, _missionId).pipe(take(1)).subscribe({
				next: result => res.send(result), error: error => next(error)
			});
		});

		this._router.post('/createMission', (req: Request, res: Response, next: NextFunction) => {
			const mission: Mission = req.body;
			this.bl.createMission(mission).pipe(take(1)).subscribe({
				next: result => res.send(result), error: error => next(error)
			});
		});

		this._router.put('/leaveMission', (req: Request, res: Response, next: NextFunction) => {
			const { userId, missionId } = req.body;
			const _missionId = missionId instanceof ObjectId ? missionId : new ObjectId(missionId);
			this.bl.leaveMission(userId, _missionId).pipe(take(1)).subscribe({
				next: result => res.send(result), error: error => next(error)
			});
		});

		this._router.post('/getAllMissionsOfUser', (req: Request, res: Response, next: NextFunction) => {
			const { userId } = req.body;
			this.bl.getAllMissionsOfUser(userId).pipe(take(1)).subscribe({
				next: result => res.send(result), error: error => next(error)
			});
		});

		this._router.put('/updateMission', (req: Request, res: Response, next: NextFunction) => {
			const mission: Mission = req.body;
			mission._id = mission._id instanceof ObjectId ? mission._id : new ObjectId(mission._id);
			this.bl.updateMission(mission).pipe(take(1)).subscribe({
				next: result => res.send(result), error: error => next(error)
			});
		});
	};
}