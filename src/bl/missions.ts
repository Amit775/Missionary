import { MissionsDAL } from './../dal/missions';
import { Observable } from 'rxjs';
import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';

import { INJECTOR } from '../config/types';
import { Permission } from '../models/permission';
import { Mission, NewMission } from '../models/mission';
import { State } from '../models/state';
import { User } from 'src/models/user';

@injectable()
export class MissionsBL {
	@inject(INJECTOR.MissionsDAL) private dal: MissionsDAL

	getAllMissions(): Observable<Mission[]> {
		return this.dal.getAllMissions();
	}
	getMissionById(id: ObjectId): Observable<Mission> {
		return this.dal.getMissionById(id);
	}
	getMissionsByIds(ids: ObjectId[]): Observable<Mission[]> {
		return this.dal.getMissionsByIds(ids);
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
	createMission(newMission: NewMission): Observable<Mission> {
		const user: User = {
			_id: 'id current user',
			name: 'current user',
			hierarchy: 'current/user'
		};

		const mission: Mission = {
			...newMission,
			_id: null,
			createdTime: new Date(),
			updatedTime: new Date(),
			creator: user,
			isExported: false,
			joinRequests: [],
			sequence: 'getMaxSequence'.length,
			state: State.CREATED,
			users: [{ ...user, permission: Permission.ADMIN }]
		}

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
