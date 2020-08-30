import { INJECTOR } from '../config/types';
import { injectable, inject } from 'inversify';
import { Permission } from './../models/permission';
import { ObjectId } from 'mongodb';
import { IMissionsDAL } from '../dal/missions';
import { Mission } from '../models/mission';
import { WithoutId } from '../models/without-id';

export interface IMissionsBL {
	ok(): boolean;
	getAllMissions(): Mission[];
	getAllMissionsNames(): Mission[];
	getMissionById(id: ObjectId): Mission;
	getMissionsByIds(...ids: ObjectId[]): Mission[];
	getPermissionsOfUser(userId: string, missionId: ObjectId): Permission;
	exportMission(missionId: ObjectId): boolean;
	askToJoinToMission(userId: string, missionId: ObjectId): void;
	createMission(mission: WithoutId<Mission>): WithoutId<Mission>;
	leaveMission(missionId: ObjectId, userId: string): void;
	getAllMissionsOfUser(userId: string): Mission[];
	updateMission(mission: Mission): Mission;
	deleteMission(mission: Mission): Mission;
}

@injectable()
export class MissionsBL implements IMissionsBL {
	@inject(INJECTOR.MissionsDAL) private dal: IMissionsDAL

	public ok(): boolean {
		return this.dal.ok();
	}

	getAllMissionsNames(): Mission[] {
		throw new Error("Method not implemented.");
	}
	getMissionById(id: ObjectId): Mission {
		throw new Error("Method not implemented.");
	}
	getMissionsByIds(...ids: ObjectId[]): Mission[] {
		throw new Error("Method not implemented.");
	}
	getPermissionsOfUser(userId: string, missionId: ObjectId): Permission {
		throw new Error("Method not implemented.");
	}
	exportMission(missionId: ObjectId): boolean {
		throw new Error("Method not implemented.");
	}
	askToJoinToMission(userId: string, missionId: ObjectId): void {
		throw new Error("Method not implemented.");
	}
	leaveMission(missionId: ObjectId, userId: string): void {
		throw new Error("Method not implemented.");
	}
	getAllMissionsOfUser(userId: string): Mission[] {
		throw new Error("Method not implemented.");
	}
	updateMission(mission: Mission): Mission {
		throw new Error("Method not implemented.");
	}
	deleteMission(mission: Mission): Mission {
		throw new Error("Method not implemented.");
	}

	getAllMissions() {
		return [];
	}
	createMission(mission: WithoutId<Mission>): WithoutId<Mission> {
		return mission;
	}

}