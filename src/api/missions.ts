import { default as express, Router, Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { take } from 'rxjs/operators';
import { ObjectId } from 'mongodb';

import { API } from './api';
import { Mission, BaseMission } from '../models/mission';
import { INJECTOR } from '../config/types';
import { MissionsBL } from '../bl/missions';
import { User } from '../models/user';
import { MissingArgumentError, InvalidArgumentError, NotFoundError, ActionFailedError } from '../logger/error';
import { Permission } from '../models/permission';
import { authentication, authorization } from '../logger/auth';
import { TRequest, validation } from '../utils/validation';


interface UserId { userId: string };
interface UserIdWithPermission extends UserId { permission: Permission };

@injectable()
export class MissionsAPI implements API {
	@inject(INJECTOR.MissionsBL) private bl: MissionsBL

	public get prefix(): string { return '/missions'; }
	public get router(): Router { return this._router; }

	private readonly _router: Router;

	constructor() {
		this._router = express.Router();
		this.router.use(authentication());

		this.router.get('/getAllMissions',
			(request: Request, response: Response, next: NextFunction) => {
				this.bl.getAllMissions().pipe(take(1)).subscribe({
					next: (result: Mission[]) => response.send(result), error: (error: any) => next(error)
				});
			}
		);

		this.router.get('/getAllMissionsNames',
			(request: Request, response: Response, next: NextFunction) => {
				this.bl.getAllMissionsNames().pipe(take(1)).subscribe({
					next: (result: string[]) => response.send(result), error: (error: any) => next(error)
				});
			}
		);

		this.router.get('/getMissionById/:id',
			(request: Request, response: Response, next: NextFunction) => {
				const missionId: ObjectId = new ObjectId(request.params.id);

				this.bl.getMissionById(missionId).pipe(take(1)).subscribe({
					next: (result: Mission) => {
						if (!result) return next(new NotFoundError(`mission with id: ${missionId.toHexString()}`));

						response.send(result);
					},
					error: (error: any) => next(error)
				});
			}
		);

		// Todo: check if necessery
		this.router.post('/getMissionsByIds',
			validation<{ ids: string[] }>([{ name: 'ids', type: 'object' }]),
			(request: TRequest<{ ids: string[] }>, response: Response, next: NextFunction) => {
				const ids: string[] = request.body.ids;

				if (!Array.isArray(ids) || ids.length === 0) return next(new InvalidArgumentError('ids', ids));

				const _ids: ObjectId[] = ids.map((id: string | ObjectId) => id instanceof ObjectId ? id : new ObjectId(id));
				this.bl.getMissionsByIds(_ids).pipe(take(1)).subscribe({
					next: (result: Mission[]) => {
						if (!result || result.length == 0)
							return next(new NotFoundError(`missions with ids: [${ids.join(', ')}]`))

						response.send(result);
					},
					error: (error: any) => next(error)
				});
			}
		);

		// Todo: check if necessery
		// Todo: validate query
		this.router.get('/getPermissionsOfUser',
			(request: Request, response: Response, next: NextFunction) => {
				const { userId, missionId } = request.query;
				if (!userId) return next(new MissingArgumentError('userId'));
				if (!missionId) return next(new MissingArgumentError('missionId'));

				const _missionId = missionId instanceof ObjectId ? missionId : new ObjectId(missionId.toString());
				this.bl.getPermissionsOfUser(userId.toString(), _missionId).pipe(take(1)).subscribe({
					next: (result: Permission) => response.send(`${result}`), error: (error: any) => next(error)
				});
			}
		);

		this.router.get('/getAllMissionsOfUser',
			(request: Request, response: Response, next: NextFunction) => {
				const currentUser: User = response.locals.currentUser;

				this.bl.getAllMissionsOfUser(currentUser._id).pipe(take(1)).subscribe({
					next: (result: Mission[]) => response.send(result), error: (error: any) => next(error)
				});
			}
		);

		this.router.post('/createMission',
			validation<BaseMission>(['name', 'description']),
			(request: TRequest<BaseMission>, response: Response, next: NextFunction) => {
				const currentUser: User = response.locals.currentUser;

				let baseMission: BaseMission = request.body;

				this.bl.createMission(baseMission, currentUser).pipe(take(1)).subscribe({
					next: (result: Mission) => response.send(result), error: (error: any) => next(error)
				});
			}
		);

		this.router.put('/askToJoinToMission/:id',
			(request: Request, response: Response, next: NextFunction) => {
				const missionId: ObjectId = new ObjectId(request.params.id);
				const currentUser: User = response.locals.currentUser;

				this.bl.askToJoinToMission(currentUser._id, missionId).pipe(take(1)).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('askToJoinToMission'));

						response.send(result)
					},
					error: (error: any) => next(error)
				});
			}
		);

		this.router.put('/cancelJoinRequest/:id',
			(request: Request, response: Response, next: NextFunction) => {
				const missionId: ObjectId = new ObjectId(request.params.id);
				const currentUser: User = response.locals.currentUser;

				this.bl.cancelOrRejectJoinRequest(currentUser._id, missionId).pipe(take(1)).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('cancelJoinRequest'));

						response.send(result)
					},
					error: (error: any) => next(error)
				});
			}
		);

		this.router.put('/leaveMission/:id',
			(request: Request, response: Response, next: NextFunction) => {
				const missionId: ObjectId = new ObjectId(request.params.id);
				const currentUser: User = response.locals.currentUser;

				this.bl.leaveOrRemoveUserFromMission(currentUser._id, missionId).pipe(take(1)).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('leaveMission'));

						response.send(result)
					},
					error: (error: any) => next(error)
				});
			}
		);


		this.router.put('/updateMission/:id',
			authorization(Permission.WRITE),
			validation<BaseMission>(['name', 'description'], false),
			(request: TRequest<BaseMission>, response: Response, next: NextFunction) => {
				const missionId: ObjectId = new ObjectId(request.params.id);

				const baseMission: BaseMission = request.body;

				this.bl.updateMission(missionId, baseMission).pipe(take(1)).subscribe({
					next: (result: Mission) => response.send(result), error: (error: any) => next(error)
				});

			}
		);

		this.router.put('/exportMission/:id',
			authorization(Permission.WRITE),
			(request: Request, response: Response, next: NextFunction) => {
				const missionId: ObjectId = new ObjectId(request.params.id);

				this.bl.setExportedMission(missionId, true).pipe(take(1)).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('exportMission'));

						response.send(result);
					},
					error: (error: any) => next(error)
				});
			}
		);

		this.router.put('/unexportMission/:id',
			authorization(Permission.WRITE),
			(request: Request, response: Response, next: NextFunction) => {
				const missionId: ObjectId = new ObjectId(request.params.id);

				this.bl.setExportedMission(missionId, false).pipe(take(1)).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('unexportMission'));

						response.send(result);
					},
					error: (error: any) => next(error)
				});
			}
		);


		this.router.put('/acceptJoinRequest/:id',
			validation<UserIdWithPermission>(['userId', { name: 'permission', type: Permission }]),
			authorization(Permission.ADMIN),
			(request: Request, response: Response, next: NextFunction) => {
				const missionId: ObjectId = new ObjectId(request.params.id);
				const { userId, permission }: UserIdWithPermission = request.body;

				this.bl.addUserToMission(userId, permission, missionId).pipe(take(1)).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('acceptJoinRequest'));

						response.send(result)
					},
					error: (error: any) => next(error)
				});
			}
		);

		this.router.put('/rejectJoinRequest/:id',
			validation<UserId>(['userId']),
			authorization(Permission.ADMIN),
			(request: Request, response: Response, next: NextFunction) => {
				const missionId: ObjectId = new ObjectId(request.params.id);
				const { userId }: UserId = request.body;

				this.bl.cancelOrRejectJoinRequest(userId, missionId).pipe(take(1)).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('rejectJoinRequest'));

						response.send(result)
					},
					error: (error: any) => next(error)
				});
			}
		);

		this.router.put('/addUserToMission/:id',
			validation<UserIdWithPermission>(['userId', { name: 'permission', type: Permission }]),
			authorization(Permission.ADMIN),
			(request: Request, response: Response, next: NextFunction) => {
				const missionId: ObjectId = new ObjectId(request.params.id);
				const { userId, permission }: UserIdWithPermission = request.body;

				this.bl.addUserToMission(userId, permission, missionId).pipe(take(1)).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('addUserToMission'));

						response.send(result)
					},
					error: (error: any) => next(error)
				});
			}
		);

		this.router.put('/removeUserFromMission/:id',
			validation<UserId>(['userId']),
			authorization(Permission.ADMIN),
			(request: Request, response: Response, next: NextFunction) => {
				const missionId: ObjectId = new ObjectId(request.params.id);
				const { userId }: UserId = request.body;

				this.bl.leaveOrRemoveUserFromMission(userId, missionId).pipe(take(1)).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('removeUserFromMission'));

						response.send(result)
					},
					error: (error: any) => next(error)
				});
			}
		);

		this.router.put('/changeUserPermission/:id',
			validation<UserIdWithPermission>(['userId', { name: 'permission', type: 'number' }]),
			authorization(Permission.ADMIN),
			(request: TRequest<UserIdWithPermission>, response: Response, next: NextFunction) => {
				const missionId: ObjectId = new ObjectId(request.params.id);
				const { userId, permission }: UserIdWithPermission = request.body;

				this.bl.changeUserPermission(userId, permission, missionId).pipe(take(1)).subscribe({
					next: (result: boolean) => {
						if (!result) return next(new ActionFailedError('changeUserPermission'));

						response.send(result)
					},
					error: (error: any) => next(error)
				});
			}
		);
	};
}
