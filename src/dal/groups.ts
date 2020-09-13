import { inject, injectable } from 'inversify';
import { Logger } from 'winston';

import { IConfig } from '../config/injector';
import { INJECTOR } from '../config/types';
import { BaseDAL } from './base';


@injectable()
export class GroupsDAL extends BaseDAL<{ _id: string }> {

	constructor(
		@inject(INJECTOR.Config) config: IConfig,
		@inject(INJECTOR.Logger) logger: Logger,
	) { super(config, logger, 'groups'); }

	public ok(): boolean {
		return true;
	}
}
