import { Observable } from 'rxjs';
import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';

import { INJECTOR } from '../config/types';
import { Permission } from '../models/permission';
import { Mission } from '../models/mission';
import { IMissionsDAL } from '../dal/missions';

export interface IMissionsBL {
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
export class MissionsBL implements IMissionsBL {
	@inject(INJECTOR.MissionsDAL) private dal: IMissionsDAL

	getAllMissions(): Observable<Mission[]> {
		return this.dal.getAllMissions();
	}
	getMissionById(id: ObjectId): Observable<Mission> {
		return this.dal.getMissionById(id);
	}
	getMissionsByIds(...ids: ObjectId[]): Observable<Mission[]> {
		return this.dal.getMissionsByIds(...ids);
	}
	getPermissionsOfUser(userId: string, missionId: ObjectId): Observable<Permission> {
		return this.dal.getPermissionsOfUser(userId, missionId);
	}
	exportMission(missionId: ObjectId): Observable<boolean> {
		return this.dal.exportMission(missionId);
	}
	askToJoinToMission(userId: string, missionId: ObjectId): Observable<void> {
		return this.dal.askToJoinToMission(userId, missionId);
	}
	createMission(mission: Mission): Observable<Mission> {
		return this.dal.createMission(mission);
	}
	leaveMission(userId: string, missionId: ObjectId): Observable<void> {
		return this.dal.leaveMission(userId, missionId);
	}
	getAllMissionsOfUser(userId: string): Observable<Mission[]> {
		return this.dal.getAllMissionsOfUser(userId);
	}
	updateMission(mission: Mission): Observable<Mission> {
		return this.dal.updateMission(mission);
	}
	getAllMissionsNames(): Observable<string[]> {
		return this.dal.getAllMissionsNames();
	}
}