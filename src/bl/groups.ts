import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';
import { Observable } from 'rxjs';

import { GroupsDAL } from '../dal/groups';
import { INJECTOR } from '../config/injector';
import { User } from '../models/user';
import { UpdateableGroup, BaseGroup, Group } from '../models/group';
import { Role } from '../models/permission';


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
	createGroup(baseGroup: BaseGroup): Observable<Group> {
		const user: User = getUserById('currentUser');
		const group: Group = {
			...baseGroup,
			_id: null,
			creator: user,
			users: [{ ...user, role: Role.ADMIN }],
			joinRequests: []
		};

		return this.dal.createGroup(group);
	}
	updateGroup(updatedGroup: UpdateableGroup): Observable<Group> {
		return this.dal.updateGroup(updatedGroup);
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
