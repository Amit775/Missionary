import { merge, Observable } from 'rxjs';
import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';

import { INJECTOR } from '../config/types';
import { MissionsDAL } from '../dal/missions';
import { Permission } from '../models/permission';
import { Mission, BaseMission } from '../models/mission';
import { State } from '../models/state';
import { User } from '../models/user';


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
	getAllMissionsOfUser(userId: string): Observable<Mission[]> {
		return this.dal.getAllMissionsOfUser(userId);
	}
	getAllMissionsNames(): Observable<string[]> {
		return this.dal.getAllMissionsNames();
	}
	createMission(baseMission: BaseMission, currentUserId: string): Observable<Mission> {
		const mission: Mission = {
			...baseMission,
			_id: null,
			createdTime: new Date(),
			updatedTime: new Date(),
			creator: currentUserId,
			isExported: false,
			joinRequests: [],
			sequence: 'getMaxSequence'.length,
			state: State.CREATED,
			users: [{ _id: currentUserId, permission: Permission.ADMIN }]
		}

		return this.dal.createMission(mission);
	}
	updateMission(missionId: ObjectId, baseMission: BaseMission): Observable<Mission> {
		return this.dal.updateMission(missionId, baseMission);
	}
	setExportedMission(missionId: ObjectId, isExported: boolean): Observable<boolean> {
		return this.dal.setExportedMission(missionId, isExported);
	}
	askToJoinToMission(userId: string, missionId: ObjectId): Observable<boolean> {
		return this.dal.addToJoinRequest(userId, missionId);
	}
	cancelOrRejectJoinRequest(userId: string, missionId: ObjectId): Observable<boolean> {
		return this.dal.removeFromJoinRequest(userId, missionId);
	}
	addUserToMission(userId: string, permission: Permission, missionId: ObjectId): Observable<boolean> {
		return this.dal.addUserToMission(userId, permission, missionId);
	}
	changeUserPermission(userId: string, permission: Permission, missionId: ObjectId): Observable<boolean> {
		return merge(
			this.dal.removeUserFromMission(userId, missionId),
			this.dal.addUserToMission(userId, permission, missionId)
		);
	}
	leaveOrRemoveUserFromMission(userId: string, missionId: ObjectId): Observable<boolean> {
		return this.dal.removeUserFromMission(userId, missionId);
	}
}
