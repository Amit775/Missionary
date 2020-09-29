import { BaseGroup } from '../models/group';
import { FindAndModifyWriteOpResultObject, InsertOneWriteOpResult, ObjectId } from 'mongodb';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Group } from '../models/group';
import { UserWithRole } from '../models/user';
import { IConfig } from '../config/injector';
import { INJECTOR } from '../config/types';
import { BaseDAL } from './base';


@injectable()
export class GroupsDAL extends BaseDAL<Group> {

	constructor(
		@inject(INJECTOR.Config) config: IConfig,
		@inject(INJECTOR.Logger) logger: Logger,
	) { super(config, logger, 'groups'); }

	getGroups(): Observable<Group[]> {
		return this.find$({});
	}

	getGroupsOfUser(userId: string): Observable<Group[]> {
		return this.find$({ users: { $all: [{ $elemMatch: userId }] } });
	}

	getGroupById(groupId: ObjectId): Observable<Group> {
		return this.findOne$({ _id: groupId });
	}

	createGroup(group: Group): Observable<Group> {
		return this.insertOne$(group).pipe(map((result: InsertOneWriteOpResult<Group>) => result.ops[0]))
	}

	updateGroup(groupdId: ObjectId, baseGroup: BaseGroup): Observable<Group> {
		Object.keys(baseGroup).forEach((key: string) => baseGroup[key] === undefined && delete baseGroup[key]);
		return this.findOneAndUpdate$({ _id: groupdId }, { $set: baseGroup }, { returnOriginal: false })
			.pipe(map((result: FindAndModifyWriteOpResultObject<Group>) => result.value));
	}

	addUserToGroup(groupId: ObjectId, user: UserWithRole): Observable<boolean> {
		return this.findOneAndUpdate$({ _id: groupId }, { $addToSet: { users: user }, $pull: { joinRequests: user._id } })
			.pipe(map(this.isUpdateOk()));
	}

	removeUserFromGroup(groupId: ObjectId, userId: string): Observable<boolean> {
		return this.findOneAndUpdate$({ _id: groupId }, { $pull: { users: { _id: userId } } })
			.pipe(map(this.isUpdateOk()));
	}

	addUserToJoinRequests(groupId: ObjectId, userId: string): Observable<boolean> {
		return this.findOneAndUpdate$({ _id: groupId }, { $addToSet: { joinRequests: userId } })
			.pipe(map(this.isUpdateOk()));
	}

	removeUserFromJoinRequests(groupId: ObjectId, userId: string): Observable<boolean> {
		return this.findOneAndUpdate$({ _id: groupId }, { $pull: { joinRequests: userId } })
			.pipe(map(this.isUpdateOk()));
	}
}
