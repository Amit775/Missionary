import { ObjectId } from 'mongodb';

export interface UsersGroup {
	_id: ObjectId;
	name: string;
	description: string;
	creatorId: string;
	usersIds: string[];
	managersIds: string[];
	joinRequest: string[];
}