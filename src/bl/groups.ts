import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';
import { Observable } from 'rxjs';

import { GroupsDAL } from '../dal/groups';
import { INJECTOR } from '../config/types';
import { BaseGroup, Group } from '../models/group';
import { Role } from '../models/permission';


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
	createGroup(baseGroup: BaseGroup, currentUserId: string): Observable<Group> {
		const group: Group = {
			...baseGroup,
			_id: null,
			creator: currentUserId,
			users: [{ _id: currentUserId, role: Role.ADMIN }],
			joinRequests: []
		};

		return this.dal.createGroup(group);
	}
	updateGroup(groupdId: ObjectId, baseGroup: BaseGroup): Observable<Group> {
		return this.dal.updateGroup(groupdId, baseGroup);
	}
	addUser(userId: string, groupId: ObjectId): Observable<boolean> {
		return this.dal.addUserToGroup(groupId, { _id: userId, role: Role.MEMBER });
	}
	leaveOrRemoveUser(userId: string, groupId: ObjectId): Observable<boolean> {
		return this.dal.removeUserFromGroup(groupId, userId);
	}
	askJoinGroup(userId: string, groupId: ObjectId): Observable<boolean> {
		return this.dal.addUserToJoinRequests(groupId, userId);
	}
	cancelOrRejectJoinRequest(userId: string, groupId: ObjectId): Observable<boolean> {
		return this.dal.removeUserFromJoinRequests(groupId, userId);
	}
}
