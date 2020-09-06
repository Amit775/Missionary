import { Permission } from './permission';


export interface User {
	_id: string;
	name: string;
	hierarchy: string;
}

export type UserWithPermission = User & { permission: Permission };
