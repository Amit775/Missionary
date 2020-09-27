import { BaseGroup, Group } from './../models/group';
import { injectable, inject } from 'inversify';

import { GroupsDAL } from '../dal/groups';
import { INJECTOR } from '../config/types';
import { User } from '../models/user';
import { ObjectId } from 'mongodb';
import { UpdateableGroup } from 'src/models/group';
import { Observable } from 'rxjs';
import { Role } from 'src/models/permission';

function getUserById(userId: string): User {
	return { _id: userId, name: 'somename', hierarchy: 'some/hierarchy' };
}

@injectable()
export class GroupsBL {
	@inject(INJECTOR.GroupsDAL) private dal: GroupsDAL;

	getGroups(): Observable<Group[]> {
		return this.dal.getGroups();
	}
	getGroupsOfUser(userId: string): Observable<Group[]> {
		return this.dal.getGroupsOfUser(userId);
	}
	getGroupById(id: ObjectId): Observable<Group> {
		return this.dal.getGroupById(id);
	}
	createGroup(newGroup: BaseGroup): Observable<Group> {
		throw new Error('Method not implemented.');
	}
	updateGroup(updatedGroup: UpdateableGroup): Observable<Group> {
		throw new Error('Method not implemented.');
	}
	addUser(userId: string, groupId: ObjectId): Observable<void> {
		const user: User = getUserById(userId);
		return this.dal.addUserToGroup(groupId, { ...user, role: Role.MEMBER });
	}
	leaveOrRemoveUser(userId: string, groupId: ObjectId): Observable<void> {
		return this.dal.removeUserFromGroup(groupId, userId);
	}
	askJoinGroup(userId: string, groupId: ObjectId): Observable<void> {
		return this.dal.addUserToJoinRequests(groupId, userId);
	}
	cancelOrRejectJoinRequest(userId: string, groupId: ObjectId): Observable<void> {
		return this.dal.removeUserFromJoinRequests(groupId, userId);
	}
}
