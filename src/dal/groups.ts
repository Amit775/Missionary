import { UpdateableGroup } from 'src/models/group';
import { ObjectId } from 'mongodb';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { Observable } from 'rxjs';
import { map, switchMapTo } from 'rxjs/operators';

import { Group } from '../models/group';
import { UserWithRole } from '../models/user';
import { IConfig, INJECTOR } from '../config/injector';
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
		return this.insertOne$(group).pipe(map(result => result.ops[0]))
	}

	updateGroup(group: UpdateableGroup): Observable<Group> {
		Object.keys(group).forEach((key: string) => group[key] === undefined && delete group[key]);
		return this.findOneAndUpdate$({ _id: group._id }, { $set: group })
			.pipe(map(result => result.value));
	}

	addUserToGroup(groupId: ObjectId, user: UserWithRole): Observable<void> {
		return this.findOneAndUpdate$({ _id: groupId }, { $addToSet: { users: user }, $pull: { joinRequests: user._id } })
			.pipe(switchMapTo(null));
	}

	removeUserFromGroup(groupId: ObjectId, userId: string): Observable<void> {
		return this.findOneAndUpdate$({ _id: groupId }, { $pull: { users: { _id: userId } } })
			.pipe(switchMapTo(null));
	}

	addUserToJoinRequests(groupId: ObjectId, userId: string): Observable<void> {
		return this.findOneAndUpdate$({ _id: groupId }, { $addToSet: { joinRequests: userId } })
			.pipe(switchMapTo(null));
	}

	removeUserFromJoinRequests(groupId: ObjectId, userId: string): Observable<void> {
		return this.findOneAndUpdate$({ _id: groupId }, { $pull: { joinRequests: userId } })
			.pipe(switchMapTo(null));
	}
}
