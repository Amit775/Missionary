import { IGroupsDAL } from './../dal/groups';
import { injectable, inject } from 'inversify';
import { INJECTOR } from '../config/types';

export interface IGroupsBL {
	ok(): boolean;
}

@injectable()
export class GroupsBL implements IGroupsBL {
	@inject(INJECTOR.GroupsDAL) private dal: IGroupsDAL;

	public ok(): boolean {
		return this.dal.ok();
	}
}