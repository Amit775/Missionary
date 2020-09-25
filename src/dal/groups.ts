import { ObjectId } from 'mongodb';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { Observable } from 'rxjs';
import { map, switchMapTo } from 'rxjs/operators';

import { UsersGroup } from '../models/users-group';
import { IConfig } from '../config/injector';
import { INJECTOR } from '../config/types';
import { BaseDAL } from './base';


@injectable()
export class GroupsDAL extends BaseDAL<UsersGroup> {

	constructor(
		@inject(INJECTOR.Config) config: IConfig,
		@inject(INJECTOR.Logger) logger: Logger,
	) { super(config, logger, 'groups'); }

	createGroup(group: UsersGroup): Observable<UsersGroup> {
		return this.insertOne$(group).pipe(map(result => result.ops[0]))
	}

	addUserToGroup(groupId: ObjectId, userId: string): Observable<void> {
		return this.findOneAndUpdate$({ _id: groupId }, { $addToSet: { usersIds: userId } }).pipe(switchMapTo(null));
	}

	removeUserFromGroup(groupId: ObjectId, userId: string): Observable<void> {
		return this.findOneAndUpdate$({ _id: groupId }, { $pull: { usersIds: userId } }).pipe(switchMapTo(null));
	}

	getGroupsOfUser(userId: string): Observable<UsersGroup[]> {
		return this.find$({ usersIds: { $all: [{ $elemMatch: userId }] } });
	}

	getGroupById(groupId: ObjectId): Observable<UsersGroup> {
		return this.findOne$({ _id: groupId });
	}

	addUserToJoinRequest(groupId: ObjectId, userId: string): Observable<void> {
		return this.findOneAndUpdate$({ _id: groupId }, { $addToSet: { joinRequest: userId } }).pipe(switchMapTo(null));
	}

	removeUserFromJoinRequest(groupId: ObjectId, userId: string): Observable<void> {
		return this.findOneAndUpdate$({ _id: groupId }, { $pull: { joinRequest: userId } }).pipe(switchMapTo(null));
	}

	upgradeUserToMangaer(groupId: ObjectId, userId: string): Observable<void> {
		return this.findOneAndUpdate$({ _id: groupId }, { $addToSet: { managersIds: userId } }).pipe(switchMapTo(null));
	}

	downgradeUserFromManager(groupId: ObjectId, userId: string): Observable<void> {
		return this.findOneAndUpdate$({ _id: groupId }, { $pull: { managersIds: userId } }).pipe(switchMapTo(null));
	}
}
