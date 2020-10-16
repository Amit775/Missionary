import { injectable, inject } from 'inversify';
import { Logger } from 'winston';

import { User } from '../models/user';
import { BaseDAL } from './base';
import { IConfig } from '../config/injector';
import { INJECTOR } from '../config/types';
import { Observable } from 'rxjs';
import { InsertOneWriteOpResult } from 'mongodb';
import { map } from 'rxjs/operators';


@injectable()
export class UsersDAL extends BaseDAL<User> {

	constructor(
		@inject(INJECTOR.Config) config: IConfig,
		@inject(INJECTOR.Logger) logger: Logger,
	) { super(config, logger, 'users'); }

	getAllUsers(): Observable<User[]> {
		return this.find$({});
	}

	getUserById(_id: string): Observable<User> {
		return this.findOne$({ _id });
	}

	createUser(user: User): Observable<User> {
		return this.insertOne$(user).pipe(
			map((result: InsertOneWriteOpResult<User>) => result.ops[0])
		);
	}

	

}
