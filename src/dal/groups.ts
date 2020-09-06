import { injectable } from 'inversify';


export interface IGroupsDAL {
	ok(): boolean;
}

@injectable()
export class GroupsDAL implements IGroupsDAL {
	public ok(): boolean {
		return true;
	}
}
