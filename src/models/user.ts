import { Permission } from './permission';
export interface User {
	Id: string;
	Name: string;
	Hierarchy: string;
}

export type UserWithPermission = User & { Permission: Permission };