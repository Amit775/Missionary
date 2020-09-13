import { injectable, inject } from 'inversify';

import { UsersDAL } from '../dal/users';
import { INJECTOR } from '../config/types';


@injectable()
export class UsersBL {
	@inject(INJECTOR.UsersDAL) dal: UsersDAL;

	public ok(): boolean {
		return this.dal.ok();
	}
}
