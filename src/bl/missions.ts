import { INJECTOR } from '../config/types';
import { injectable, inject } from 'inversify';
import { Permission } from './../models/permission';
import { ObjectId } from 'mongodb';
import { IMissionsDAL } from '../dal/missions';
import { Mission } from '../models/mission';

export interface IMissionsBL {
	getAllMissions(): Promise<Mission[]>;
	getAllMissionsNames(): Promise<string[]>;
	getMissionById(id: ObjectId): Promise<Mission>;
	getMissionsByIds(...ids: ObjectId[]): Promise<Mission[]>;
	getPermissionsOfUser(userId: string, missionId: ObjectId): Promise<Permission>;
	exportMission(missionId: ObjectId): Promise<boolean>;
	askToJoinToMission(userId: string, missionId: ObjectId): Promise<void>;
	createMission(mission: Mission): Promise<Mission>;
	leaveMission(missionId: ObjectId, userId: string): Promise<void>;
	getAllMissionsOfUser(userId: string): Promise<Mission[]>;
	updateMission(mission: Mission): Promise<Mission>;
}

@injectable()
export class MissionsBL implements IMissionsBL {
	@inject(INJECTOR.MissionsDAL) private dal: IMissionsDAL

	getAllMissions(): Promise<Mission[]> {
		return this.dal.getAllMissions();
	}
	getMissionById(id: ObjectId): Promise<Mission> {
		return this.dal.getMissionById(id);
	}
	getMissionsByIds(...ids: ObjectId[]): Promise<Mission[]> {
		return this.dal.getMissionsByIds(...ids);
	}
	getPermissionsOfUser(userId: string, missionId: ObjectId): Promise<Permission> {
		return this.dal.getPermissionsOfUser(userId, missionId);
	}
	exportMission(missionId: ObjectId): Promise<boolean> {
		return this.dal.exportMission(missionId);
	}
	askToJoinToMission(userId: string, missionId: ObjectId): Promise<void> {
		return this.dal.askToJoinToMission(userId, missionId);
	}
	createMission(mission: Mission): Promise<Mission> {
		return this.dal.createMission(mission);
	}
	leaveMission(missionId: ObjectId, userId: string): Promise<void> {
		return this.dal.leaveMission(missionId, userId);
	}
	getAllMissionsOfUser(userId: string): Promise<Mission[]> {
		return this.dal.getAllMissionsOfUser(userId);
	}
	updateMission(mission: Mission): Promise<Mission> {
		return this.dal.updateMission(mission);
	}
	async getAllMissionsNames(): Promise<string[]> {
		return await this.dal.getAllMissionsNames();
	}
}