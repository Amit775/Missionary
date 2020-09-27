import { ObjectId } from 'mongodb';

import { User, UserWithRole } from './user';


export type BaseGroup = Pick<Group, 'name' | 'description'>
export type UpdateableGroup = Pick<Group, '_id'> & Partial<BaseGroup>;

export interface Group {
	_id: ObjectId;
	name: string;
	description: string;
	creator: User;
	users: UserWithRole[];
	joinRequests: string[];
}