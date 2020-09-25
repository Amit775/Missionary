import { ObjectId } from 'mongodb';

import { User, UserWithPermission } from './user';
import { State } from './state';

export type BaseMission = Pick<Mission, 'name' | 'description'>
export type UpdateableMission = Pick<Mission, '_id'> & Partial<BaseMission>;

export interface Mission {
	_id: ObjectId;
	name: string;
	description: string;
	users: UserWithPermission[];
	creator: User;
	createdTime: Date;
	updatedTime: Date;
	joinRequests: string[];
	state: State;
	sequence: number;
	isExported: boolean;
}
