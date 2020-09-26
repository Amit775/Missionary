import { Observable, of } from 'rxjs';
import { map, switchMapTo } from 'rxjs/operators';
import { FindAndModifyWriteOpResultObject, FindOneAndUpdateOption, ObjectId, UpdateQuery } from 'mongodb';
import { Logger } from 'winston';
import { injectable, inject } from 'inversify';

import { INJECTOR } from '../config/types';
import { IConfig } from '../config/injector';
import { Mission, UpdateableMission } from '../models/mission';
import { BaseDAL } from './base';
import { Permission } from '../models/permission';
import { User } from '../models/user';
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
			.pipe(map(({ ops }) => ops[0]));
	}

	updateMission(mission: UpdateableMission): Observable<Mission> {
		return this.updateMission$(mission._id, { $set: { name: mission.name, description: mission.description } })
			.pipe(switchMapTo(this.getMissionById(mission._id)));
	}

	setExportedMission(missionId: ObjectId, isExported: boolean): Observable<boolean> {
		return this.updateMission$(missionId, { $set: { isExported } })
			.pipe(map(({ ok }) => ok === 1));
	}

	addToJoinRequest(userId: string, missionId: ObjectId): Observable<void> {
		return this.updateMission$(missionId, { $addToSet: { joinRequests: userId } })
			.pipe(switchMapTo(of(null)));
	}

	removeFromJoinRequest(userId: string, missionId: ObjectId): Observable<void> {
		return this.updateMission$(missionId, { $pull: { joinRequests: userId } })
			.pipe(switchMapTo(null));
	}

	addUserToMission(user: User, permission: Permission, missionId: ObjectId): Observable<void> {
		return this.updateMission$(missionId, { $addToSet: { users: { ...user, permission } } })
			.pipe(switchMapTo(null));
	}

	removeUserFromMission(userId: string, missionId: ObjectId): Observable<void> {
		return this.updateMission$(missionId, { $pull: { users: { _id: userId } } })
			.pipe(switchMapTo(of()));
	}

	private updateMission$(_id: ObjectId, update: UpdateQuery<Mission>, options?: FindOneAndUpdateOption<Mission>): Observable<FindAndModifyWriteOpResultObject<Mission>> {
		update = { ...update, $set: { ...update.$set, updatedTime: new Date(), state: State.UPDATED } };
		return this.findOneAndUpdate$({ _id }, update, options)
	}
}