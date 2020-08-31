import { Mission } from '../models/mission';
import { INJECTOR } from '../config/types';
import { inject, injectable } from 'inversify';
import express, { Router, Request, Response, NextFunction } from 'express';
import { IMissionsBL } from '../bl/missions';
import { IController } from './controller.interface';
import { ObjectId } from 'mongodb';
import { Permission } from '../models/permission';
import { State } from '../models/state';

@injectable()
export class MissionsController implements IController {
	@inject(INJECTOR.MissionsBL) private bl: IMissionsBL

	public get prefix(): string { return '/missions'; }
	public get router(): Router { return this._router; }

	private readonly _router: Router;

	constructor() {
		this._router = express.Router()
		this._router.get('/', (req, res) => res.send('true'));
		this._router.post('/insertMission'), (req: Request, res: Response, next: NextFunction) => {
			const mission: Mission = { _id: new ObjectId(351), CreatedTime: new Date(), UpdatedTime: new Date(), Creator: { Hierarchy: 'Amitbublil', Name: 'Amit Bublil', Id: 'AAA' }, Name: 'Some mission', IsExported: false, Description: 'bllaa', JoinRequests: [], Users: [{ Hierarchy: 'Amitbublil', Name: 'Amit Bublil', Id: 'AAA', Permission: Permission.ADMIN }], Type: 'Type', State: State.CREATED, Sequence: 0 };
			res.send(
				this.bl.createMission(mission).catch(error => next(error))
			)
		}
		this._router.get('/askToJoinToMission', (req, res, next) => {
			const { userId, missionId } = { userId: 'userId', missionId: new ObjectId("0000015f623cbc21144c527d") };
			res.send(
				this.bl.askToJoinToMission(userId, missionId)
					.catch(error => next(error))
			);
		});


	}
}