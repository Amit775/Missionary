import { User, UserWithPermission } from './user';
import { ObjectId } from 'mongodb';
import { State } from './state';

export interface Mission {
	_id: ObjectId;
	Name: string;
	Description: string;
	Users: UserWithPermission[];
	Creator: User;
	CreatedTime: Date;
	UpdatedTime: Date;
	Type: string;
	JoinRequests: string[];
	State: State;
	Sequence: number;
	IsExported: boolean;
}
