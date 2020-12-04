import { injectable, inject } from 'inversify';

import { UsersDAL } from '../dal/users';
import { INJECTOR } from '../config/types';
import { UserClaim } from 'src/models/user';
import { Observable } from 'rxjs';
import { TreeNodesDAL } from 'src/dal/tree-nodes';


@injectable()
export class UsersBL {
	@inject(INJECTOR.UsersDAL) dal: UsersDAL;
	@inject(INJECTOR.TreeNodesDAL) treeNodeDal: TreeNodesDAL;

	public upsertUser(user: UserClaim): Observable<UserClaim> {
		return
	}
}
