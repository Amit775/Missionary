import { ObjectId } from 'mongodb';

import { User, UserWithPermission } from './user';
import { State } from './state';


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

export type BaseMission = Pick<Mission, 'name' | 'description'>
export type UpdateableMission = ({ id?: string } & { _id?: ObjectId }) & Partial<BaseMission>;
