import { injectable, inject } from 'inversify';
import { Logger } from 'winston';

import { User } from '../models/user';
import { BaseDAL } from './base';
import { INJECTOR } from '../config/types';
import { IConfig } from '../config/injector';


export interface IUsersDAL {
	ok(): boolean;
}

@injectable()
export class UsersDAL extends BaseDAL<User> implements IUsersDAL {

	constructor(
		@inject(INJECTOR.Config) config: IConfig,
		@inject(INJECTOR.Logger) logger: Logger,
	) { super(config, logger, 'users'); }
	
	public ok(): boolean {
		return true;
	}
}
