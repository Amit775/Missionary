import { default as express, Router, Request, Response, RequestHandler, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { take } from 'rxjs/operators';
import { ObjectId } from 'mongodb';

import { API } from './api';
import { TRequest, validation } from '../application/middlewares/validation';
import { authentication, authPermission } from '../application/middlewares/auth';
import { INJECTOR } from '../config/types';
import { MissionsBL } from '../bl/missions';
import { UserClaim } from '../models/user';
import { Permission } from '../models/permission';
import { Mission, BaseMission } from '../models/mission';
import { MissingArgumentError, InvalidArgumentError, NotFoundError, ActionFailedError } from '../models/error';


interface UserId { userId: string };
interface Ids { ids: string[] };
interface UserIdWithPermission extends UserId { permission: Permission };

@injectable()
export class MissionsAPI implements API {
	@inject(INJECTOR.MissionsBL) private bl: MissionsBL

	public get prefix(): string { return '/missions'; }
	public get router(): Router { return this._router; }

	private readonly _router: Router;

	private getAllMissions: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		this.bl.getAllMissions().pipe(take(1)).subscribe({
			next: (result: Mission[]) => response.send(result), error: (error: any) => next(error)
		});
	}

	private getAllMissionsNames: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		this.bl.getAllMissionsNames().pipe(take(1)).subscribe({
			next: (result: string[]) => response.send(result), error: (error: any) => next(error)
		});
	}

	private getMissionById: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const missionId: ObjectId = new ObjectId(request.params.id);

		this.bl.getMissionById(missionId).pipe(take(1)).subscribe({
			next: (result: Mission) => {
				if (!result) return next(new NotFoundError(`mission with id: ${missionId.toHexString()}`));

				response.send(result);
			},
			error: (error: any) => next(error)
		});
	}

	private getMissionsByIds: RequestHandler = (request: TRequest<Ids>, response: Response, next: NextFunction) => {
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

	private getPermissionsOfUser: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const { userId, missionId } = request.query;
		if (!userId) return next(new MissingArgumentError('userId'));
		if (!missionId) return next(new MissingArgumentError('missionId'));

		const _missionId = missionId instanceof ObjectId ? missionId : new ObjectId(missionId.toString());
		this.bl.getPermissionsOfUser(userId.toString(), _missionId).pipe(take(1)).subscribe({
			next: (result: Permission) => response.send(`${result}`), error: (error: any) => next(error)
		});
	}

	private getAllMissionsOfUser: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const currentUser: UserClaim = response.locals.currentUser;

		this.bl.getAllMissionsOfUser(currentUser._id).pipe(take(1)).subscribe({
			next: (result: Mission[]) => response.send(result), error: (error: any) => next(error)
		});
	}

	private createMission: RequestHandler = (request: TRequest<BaseMission>, response: Response, next: NextFunction) => {
		const currentUser: UserClaim = response.locals.currentUser;

		let baseMission: BaseMission = request.body;

		this.bl.createMission(baseMission, currentUser._id).pipe(take(1)).subscribe({
			next: (result: Mission) => response.send(result), error: (error: any) => next(error)
		});
	}

	private askToJoinToMission: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const missionId: ObjectId = new ObjectId(request.params.id);
		const currentUser: UserClaim = response.locals.currentUser;

		this.bl.askToJoinToMission(currentUser._id, missionId).pipe(take(1)).subscribe({
			next: (result: boolean) => {
				if (!result) return next(new ActionFailedError('askToJoinToMission'));

				response.send(result)
			},
			error: (error: any) => next(error)
		});
	}

	private cancelJoinRequest: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const missionId: ObjectId = new ObjectId(request.params.id);
		const currentUser: UserClaim = response.locals.currentUser;

		this.bl.cancelOrRejectJoinRequest(currentUser._id, missionId).pipe(take(1)).subscribe({
			next: (result: boolean) => {
				if (!result) return next(new ActionFailedError('cancelJoinRequest'));

				response.send(result)
			},
			error: (error: any) => next(error)
		});
	}

	private leaveMission: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const missionId: ObjectId = new ObjectId(request.params.id);
		const currentUser: UserClaim = response.locals.currentUser;

		this.bl.leaveOrRemoveUserFromMission(currentUser._id, missionId).pipe(take(1)).subscribe({
			next: (result: boolean) => {
				if (!result) return next(new ActionFailedError('leaveMission'));

				response.send(result)
			},
			error: (error: any) => next(error)
		});
	}

	private updateMission: RequestHandler = (request: TRequest<BaseMission>, response: Response, next: NextFunction) => {
		const missionId: ObjectId = new ObjectId(request.params.id);

		const baseMission: BaseMission = request.body;

		this.bl.updateMission(missionId, baseMission).pipe(take(1)).subscribe({
			next: (result: Mission) => response.send(result), error: (error: any) => next(error)
		});

	}

	private exportMission: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const missionId: ObjectId = new ObjectId(request.params.id);

		this.bl.setExportedMission(missionId, true).pipe(take(1)).subscribe({
			next: (result: boolean) => {
				if (!result) return next(new ActionFailedError('exportMission'));

				response.send(result);
			},
			error: (error: any) => next(error)
		});
	}

	private unexportMission: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
		const missionId: ObjectId = new ObjectId(request.params.id);

		this.bl.setExportedMission(missionId, false).pipe(take(1)).subscribe({
			next: (result: boolean) => {
				if (!result) return next(new ActionFailedError('unexportMission'));

				response.send(result);
			},
			error: (error: any) => next(error)
		});
	}

	private rejectJoinRequest: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
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

	private removeUserFromMission: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
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

	private acceptJoinRequest: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
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

	private addUserToMission: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
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

	private changeUserPermission: RequestHandler = (request: TRequest<UserIdWithPermission>, response: Response, next: NextFunction) => {
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

	constructor() {
		this._router = express.Router();
		this.router.use(authentication());
		this.router.get('/getAllMissions', this.getAllMissions);
		this.router.get('/getAllMissionsNames', this.getAllMissionsNames);
		this.router.get('/getMissionById/:id', this.getMissionById);
		this.router.post('/getMissionsByIds', validation<{ ids: string[] }>([{ name: 'ids', type: 'object' }]), this.getMissionsByIds);
		this.router.get('/getPermissionsOfUser', this.getPermissionsOfUser);
		this.router.get('/getAllMissionsOfUser', this.getAllMissionsOfUser);
		this.router.post('/createMission', validation<BaseMission>(['name', 'description']), this.createMission);
		this.router.put('/askToJoinToMission/:id', this.askToJoinToMission);
		this.router.put('/cancelJoinRequest/:id', this.cancelJoinRequest);
		this.router.put('/leaveMission/:id', this.leaveMission);

		this.router.put('/updateMission/:id', authPermission(Permission.WRITE), validation<BaseMission>(['name', 'description'], false), this.updateMission);
		this.router.put('/exportMission/:id', authPermission(Permission.WRITE), this.exportMission);
		this.router.put('/unexportMission/:id', authPermission(Permission.WRITE), this.unexportMission);

		this.router.put('/rejectJoinRequest/:id', authPermission(Permission.ADMIN), validation<UserId>(['userId']), this.rejectJoinRequest);
		this.router.put('/removeUserFromMission/:id', authPermission(Permission.ADMIN), validation<UserId>(['userId']), this.removeUserFromMission);
		this.router.put('/acceptJoinRequest/:id', authPermission(Permission.ADMIN), validation<UserIdWithPermission>(['userId', { name: 'permission', type: Permission }]), this.acceptJoinRequest);
		this.router.put('/addUserToMission/:id', authPermission(Permission.ADMIN), validation<UserIdWithPermission>(['userId', { name: 'permission', type: Permission }]), this.addUserToMission);
		this.router.put('/changeUserPermission/:id', authPermission(Permission.ADMIN), validation<UserIdWithPermission>(['userId', { name: 'permission', type: 'number' }]), this.changeUserPermission)
	};
}
