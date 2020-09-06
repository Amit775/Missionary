import { injectable } from 'inversify';

import { User } from '../models/user';
import { BaseDAL } from './base';


export interface IUsersDAL {
	ok(): boolean;
}

@injectable()
export class UsersDAL extends BaseDAL<User> implements IUsersDAL {
	public ok(): boolean {
		return true;
	}
}
