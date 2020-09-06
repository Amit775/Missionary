import { injectable } from 'inversify';
import { User } from 'src/models/user';
import { BaseDAL } from './base';

export interface IUsersDAL {
}

@injectable()
export class UsersDAL extends BaseDAL<User> implements IUsersDAL {
	public ok(): boolean {
		return true;
	}
}