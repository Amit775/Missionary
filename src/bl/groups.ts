import { injectable, inject } from 'inversify';

import { GroupsDAL } from './../dal/groups';
import { INJECTOR } from '../config/types';



@injectable()
export class GroupsBL {
	@inject(INJECTOR.GroupsDAL) private dal: GroupsDAL;

	public ok(): boolean {
		return this.dal.ok();
	}
}
