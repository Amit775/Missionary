import { ObjectId } from 'mongodb';

import { User, UserWithPermission } from './user';
import { State } from './state';

export type NewMission = Pick<Mission, 'name' | 'description' | 'type'>

export interface Mission {
	_id: ObjectId;
	name: string;
	description: string;
	users: UserWithPermission[];
	creator: User;
	createdTime: Date;
	updatedTime: Date;
	type: string;
	joinRequests: string[];
	state: State;
	sequence: number;
	isExported: boolean;
}
