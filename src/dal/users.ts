import { injectable, inject } from 'inversify';
import { Logger } from 'winston';

import { User } from '../models/user';
import { BaseDAL } from './base';
import { INJECTOR, IConfig } from '../config/injector';


@injectable()
export class UsersDAL extends BaseDAL<User> {

	constructor(
		@inject(INJECTOR.Config) config: IConfig,
		@inject(INJECTOR.Logger) logger: Logger,
	) { super(config, logger, 'users'); }

	public ok(): boolean {
		return true;
	}
}
