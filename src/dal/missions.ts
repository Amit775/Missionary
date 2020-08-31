import { Mission } from '../models/mission';
import { injectable, inject } from 'inversify';
import { BaseDAL } from './base';
import { ObjectId } from 'mongodb';
import { Logger } from 'winston';
import { Permission } from '../models/permission';
import { INJECTOR } from '../config/types';
import { IConfig } from '../config/injector';

export interface IMissionsDAL {
	getAllMissionsNames(): Promise<string[]>;
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
export class MissionsDAL extends BaseDAL<Mission> implements IMissionsDAL {
	constructor(
		@inject(INJECTOR.Config) config: IConfig,
		@inject(INJECTOR.Logger) logger: Logger,
	) { super(config, logger, 'missions'); }
	getAllMissions(): Promise<Mission[]> {
		return this.getAll();
	}
	getMissionById(id: ObjectId): Promise<Mission> {
		return this.getById(id);
	}
	getMissionsByIds(...ids: ObjectId[]): Promise<Mission[]> {
		return this.collection.find<Mission>({ _id: { $in: ids } }).toArray();
	}
	async getPermissionsOfUser(userId: string, missionId: ObjectId): Promise<Permission> {
		const mission = await this.getMissionById(missionId);
		return mission.Users.find(user => user.Id === userId).Permission;
	}
	async exportMission(missionId: ObjectId): Promise<boolean> {
		const { ok } = await this.collection.findOneAndUpdate({ _id: missionId }, { $set: { IsExported: true } });
		return ok === 1;
	}
	async askToJoinToMission(userId: string, missionId: ObjectId): Promise<void> {
		this.collection.findOneAndUpdate({ _id: missionId }, { $push: { JoinRequests: userId } });
	}
	createMission(mission: Mission): Promise<Mission> {
		return this.insertOne(mission);
	}
	async leaveMission(missionId: ObjectId, userId: string): Promise<void> {
		this.collection.findOneAndUpdate({ _id: missionId }, { $pull: { Users: { Id: userId } } });
	}
	getAllMissionsOfUser(userId: string): Promise<Mission[]> {
		return this.collection.find<Mission>({ Users: { $all: [{ "$elemMatch": { Id: userId } }] } }).toArray();
	}
	async updateMission(mission: Mission): Promise<Mission> {
		const { value } = await this.collection.findOneAndReplace({ _id: mission._id }, mission, { returnOriginal: false });
		return value;
	}
	async getAllMissionsNames(): Promise<string[]> {
		return await this.collection.find<string>({}, { projection: { _id: false, Name: true } }).toArray();
	}

	public ok(): boolean {
		return true;
	}
}