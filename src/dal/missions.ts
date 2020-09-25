import { Observable, of } from 'rxjs';
import { map, switchMapTo } from 'rxjs/operators';
import { ObjectId } from 'mongodb';
import { Logger } from 'winston';
import { injectable, inject } from 'inversify';

import { INJECTOR } from '../config/types';
import { IConfig } from '../config/injector';
import { Mission, UpdateableMission } from '../models/mission';
import { BaseDAL } from './base';
import { Permission } from '../models/permission';


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

	exportMission(missionId: ObjectId): Observable<boolean> {
		return this.findOneAndUpdate$({ _id: missionId }, { $set: { isExported: true } })
			.pipe(map(({ ok }) => ok === 1));
	}

	askToJoinToMission(userId: string, missionId: ObjectId): Observable<void> {
		return this.findOneAndUpdate$({ _id: missionId }, { $addToSet: { joinRequests: userId } })
			.pipe(switchMapTo(of(null)));
	}

	createMission(mission: Mission): Observable<Mission> {
		return this.insertOne$(mission)
			.pipe(map(({ ops }) => ops[0]));
	}

	leaveMission(userId: string, missionId: ObjectId): Observable<void> {
		return this.findOneAndUpdate$({ _id: missionId }, { $pull: { users: { _id: userId } } })
			.pipe(switchMapTo(of()));
	}

	getAllMissionsOfUser(userId: string): Observable<Mission[]> {
		return this.find$({ users: { $all: [{ $elemMatch: { _id: userId } }] } });
	}

	updateMission(mission: UpdateableMission): Observable<Mission> {
		return this.findOneAndReplace$({ _id: mission._id }, mission)
			.pipe(map(result => result.value));
	}
}