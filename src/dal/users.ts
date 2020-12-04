import { Logger } from 'winston';
import { injectable, inject } from 'inversify';
import { InsertOneWriteOpResult, ObjectId } from 'mongodb';
import { map } from 'rxjs/operators';

import { User } from '../models/user';
import { BaseDAL } from './base';
import { IConfig } from '../config/injector';
import { INJECTOR } from '../config/types';
import { Observable } from 'rxjs';


@injectable()
export class UsersDAL extends BaseDAL<User> {

	constructor(
		@inject(INJECTOR.Config) config: IConfig,
		@inject(INJECTOR.Logger) logger: Logger,
	) { super(config, logger, 'users'); }

	getAllUsers(): Observable<User[]> {
		return this.find$({});
	}

	getUsers(skip: number, limit: number): Observable<User[]> {
		return this.find$({}, { skip, limit })
	}

	findUsersByName(query: RegExp): Observable<User[]> {
		return this.find$({ name: { $regex: query } })
	}

	getUserById(_id: string): Observable<User> {
		return this.findOne$({ _id });
	}

	setOrganization(userId: string, organizationId: ObjectId): Observable<boolean> {
		return this.findOneAndUpdate$({ _id: userId }, { $set: { organizationId } }).pipe(
			map(this.isUpdateOk())
		);
	}

	createUser(user: User): Observable<User> {
		return this.insertOne$(user).pipe(
			map((result: InsertOneWriteOpResult<User>) => result.ops[0])
		);
	}
}
