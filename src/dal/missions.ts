import { FindAndModifyWriteOpResultObject, FindOneAndUpdateOption, InsertOneWriteOpResult, ObjectId, UpdateQuery } from 'mongodb';
import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseDAL } from './base';
import { IConfig } from '../config/injector';
import { INJECTOR } from '../config/types';
import { BaseMission, Mission } from '../models/mission';
import { Permission } from '../models/permission';
import { State } from '../models/state';


@injectable()
export class MissionsDAL extends BaseDAL<Mission> {
	constructor(
		@inject(INJECTOR.Config) config: IConfig,
		@inject(INJECTOR.Logger) logger: Logger,
	) { super(config, logger, 'missions'); }

	getAllMissions(): Observable<Mission[]> {
		return this.find$({});
	}

	getMissionById(id: ObjectId): Observable<Mission> {
		return this.findOne$({ _id: id });
	}

	getMissionsByIds(ids: ObjectId[]): Observable<Mission[]> {
		return this.find$({ _id: { $in: ids } });
	}

	getAllMissionsNames(): Observable<string[]> {
		return this.find$({})
			.pipe(map((missions: Mission[]) => missions.map((mission: Mission) => mission.name)));
	}

	getPermissionsOfUser(userId: string, missionId: ObjectId): Observable<Permission> {
		return this.getMissionById(missionId)
			.pipe(map(mission => mission.users.find(user => user._id === userId).permission));
	}

	getAllMissionsOfUser(userId: string): Observable<Mission[]> {
		return this.find$({ users: { $all: [{ $elemMatch: { _id: userId } }] } });
	}

	createMission(mission: Mission): Observable<Mission> {
		return this.insertOne$(mission)
			.pipe(map((result: InsertOneWriteOpResult<Mission>) => result.ops[0]));
	}

	updateMission(missionId: ObjectId, baseMission: BaseMission): Observable<Mission> {
		Object.keys(baseMission).forEach((key: string) => baseMission[key] === undefined && delete baseMission[key]);
		return this.updateMission$(missionId, { $set: baseMission }, { returnOriginal: false })
			.pipe(map((result: FindAndModifyWriteOpResultObject<Mission>) => result.value));
	}

	setExportedMission(missionId: ObjectId, isExported: boolean): Observable<boolean> {
		return this.updateMission$(missionId, { $set: { isExported } })
			.pipe(map(this.isUpdateOk()));
	}

	addToJoinRequest(userId: string, missionId: ObjectId): Observable<boolean> {
		return this.updateMission$(missionId, { $addToSet: { joinRequests: userId } })
			.pipe(map(this.isUpdateOk()));
	}

	removeFromJoinRequest(userId: string, missionId: ObjectId): Observable<boolean> {
		return this.updateMission$(missionId, { $pull: { joinRequests: userId } })
			.pipe(map(this.isUpdateOk()));
	}

	addUserToMission(userId: string, permission: Permission, missionId: ObjectId): Observable<boolean> {
		return this.updateMission$(missionId, { $addToSet: { users: { _id: userId, permission } }, $pull: { joinRequests: userId } })
			.pipe(map(this.isUpdateOk()));
	}

	removeUserFromMission(userId: string, missionId: ObjectId): Observable<boolean> {
		return this.updateMission$(missionId, { $pull: { users: { _id: userId } } })
			.pipe(map(this.isUpdateOk()));
	}

	private updateMission$(_id: ObjectId, update: UpdateQuery<Mission>, options?: FindOneAndUpdateOption<Mission>): Observable<FindAndModifyWriteOpResultObject<Mission>> {
		update = { ...update, $set: { ...update.$set, updatedTime: new Date(), state: State.UPDATED } };
		return this.findOneAndUpdate$({ _id }, update, options)
	}
}
