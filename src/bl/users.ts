import { IUsersDAL } from '../dal/users';
import { injectable, inject } from "inversify";
import { INJECTOR } from '../config/types';

export interface IUsersBL {
	ok(): boolean;
}

@injectable()
export class UsersBL implements IUsersBL {
	@inject(INJECTOR.UsersDAL) dal: IUsersDAL;

	public ok(): boolean {
		return this.dal.ok();
	}
}