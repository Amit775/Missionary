import { injectable } from 'inversify';

export interface IUsersDAL {
	ok(): boolean;
}

@injectable()
export class UsersDAL implements IUsersDAL {
	public ok(): boolean {
		return true;
	}
}