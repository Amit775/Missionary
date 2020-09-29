import { ObjectId } from 'mongodb';

import { User, UserWithRole } from './user';


export interface BaseGroup {
	name: string;
	description: string;
}
export interface Group {
	_id: ObjectId;
	creator: User;
	users: UserWithRole[];
	joinRequests: string[];
}
