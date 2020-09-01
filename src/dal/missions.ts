import { Observable, from, of } from 'rxjs';
import { map, switchMap, switchMapTo } from 'rxjs/operators';
import { ObjectId } from 'mongodb';
import { Logger } from 'winston';
import { injectable, inject } from 'inversify';

import { INJECTOR } from '../config/types';
import { IConfig } from '../config/injector';
import { Mission } from '../models/mission';
import { BaseDAL } from './base';
import { Permission } from '../models/permission';

export interface IMissionsDAL {
	getAllMissions(): Observable<Mission[]>;
	getAllMissionsNames(): Observable<string[]>;
	getMissionById(id: ObjectId): Observable<Mission>;
	getMissionsByIds(...ids: ObjectId[]): Observable<Mission[]>;
	getPermissionsOfUser(userId: string, missionId: ObjectId): Observable<Permission>;
	exportMission(missionId: ObjectId): Observable<boolean>;
	askToJoinToMission(userId: string, missionId: ObjectId): Observable<void>;
	createMission(mission: Mission): Observable<Mission>;
	leaveMission(userId: string, missionId: ObjectId): Observable<void>;
	getAllMissionsOfUser(userId: string): Observable<Mission[]>;
	updateMission(mission: Mission): Observable<Mission>;
}

@injectable()
export class MissionsDAL extends BaseDAL<Mission> implements IMissionsDAL {
	constructor(
		@inject(INJECTOR.Config) config: IConfig,
		@inject(INJECTOR.Logger) logger: Logger,
	) { super(config, logger, 'missions'); }

	getAllMissions(): Observable<Mission[]> {
		return this.getAll();
	}

	getMissionById(id: ObjectId): Observable<Mission> {
		return this.getById(id);
	}

	getMissionsByIds(...ids: ObjectId[]): Observable<Mission[]> {
		return this.find$({ _id: { $in: ids } }).pipe(switchMap(cursor => from(cursor.toArray())));
	}

	getPermissionsOfUser(userId: string, missionId: ObjectId): Observable<Permission> {
		return this.getMissionById(missionId).pipe(
			map(mission => mission.Users.find(user => user.Id === userId).Permission)
		);
	}

	exportMission(missionId: ObjectId): Observable<boolean> {
		return this.findOneAndUpdate$({ _id: missionId }, { $set: { IsExported: true } }).pipe(
			map(({ ok }) => ok === 1));
	}

	askToJoinToMission(userId: string, missionId: ObjectId): Observable<void> {
		return this.findOneAndUpdate$({ _id: missionId }, { $push: { JoinRequests: userId } }).pipe(switchMapTo(of(null)));
	}

	createMission(mission: Mission): Observable<Mission> {
		return this.insertOne(mission);
	}

	leaveMission(userId: string, missionId: ObjectId): Observable<void> {
		return this.findOneAndUpdate$({ _id: missionId }, { $pull: { Users: { Id: userId } } }).pipe(switchMapTo(of(null)));
	}

	getAllMissionsOfUser(userId: string): Observable<Mission[]> {
		return this.find$({ Users: { $all: [{ "$elemMatch": { Id: userId } }] } }).pipe(switchMap(cursor => from(cursor.toArray())));
	}

	updateMission(mission: Mission): Observable<Mission> {
		return this.findOneAndReplace$({ _id: mission._id }, mission).pipe(map(result => result.value));
	}

	getAllMissionsNames(): Observable<string[]> {
		return this.find$({}, { projection: { _id: false, Name: true } }).pipe(
			switchMap(cursor => from(cursor.toArray())),
			map((missions: Mission[]) => missions.map((mission: Mission) => mission.Name))
		);
	}
}