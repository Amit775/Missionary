import { ObjectId } from 'mongodb';

import { UserWithRole } from './user';


export interface BaseGroup {
	name: string;
	description: string;
}

export interface Group {
	_id: ObjectId;
	creator: string;
	users: UserWithRole[];
	joinRequests: string[];
}
