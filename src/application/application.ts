import { default as express, Express, json, urlencoded } from 'express';
import { multiInject, inject, injectable } from 'inversify';
import { default as cookieParser } from 'cookie-parser';
import { Logger } from 'winston';
import { default as cors } from 'cors'

import { logRequest, logResponse, logError, catchError } from './middlewares/logger';
import { setDALs } from './middlewares/auth';
import { API } from '../api/api';
import { INJECTOR } from '../config/types';
import { GroupsDAL } from '../dal/groups';
import { MissionsDAL } from '../dal/missions';


@injectable()
export class Application {
	@multiInject(INJECTOR.APIS) private apis: API[]
	@inject(INJECTOR.Logger) private logger: Logger;
	@inject(INJECTOR.MissionsDAL) private missionsDAL: MissionsDAL;
	@inject(INJECTOR.GroupsDAL) private groupsDal: GroupsDAL;

	private application: Express;

	start(): void {
		this.create()
			.listen(3000, () => this.logger.log('info', 'listen...', { service: 'main' }));
	}

	private create(): Express {
		this.application = express()
			.use(cors())
			.use(json(), urlencoded({ extended: true }), cookieParser())
			.use(logRequest(this.logger), logResponse(this.logger), setDALs(this.missionsDAL, this.groupsDal));

		this.apis.forEach(api => this.application.use(api.prefix, api.router));
		this.application.use(catchError(), logError(this.logger))

		return this.application;
	}
}
