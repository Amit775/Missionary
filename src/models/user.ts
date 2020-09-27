import { Permission, Role } from './permission';


export interface User {
	_id: string;
	name: string;
	hierarchy: string;
}

export type UserWithPermission = User & { permission: Permission };
export type UserWithRole = User & { role: Role };
