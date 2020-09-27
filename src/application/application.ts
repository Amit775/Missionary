import { default as express, Request, Response, NextFunction, Express } from 'express';
import { multiInject, inject, injectable } from 'inversify';
import { urlencoded, json } from 'body-parser';
import { Logger } from 'winston';
import { default as cors } from 'cors'

import { INJECTOR } from '../config/injector';
import { log_request, log_response, log_error, catch_error } from '../logger/middleware';
import { API } from '../api/api';


@injectable()
export class Application {
	@multiInject(INJECTOR.APIS) private apis: API[]
	@inject(INJECTOR.Logger) private logger: Logger;

	private application: Express;

	start(): void {
		this.create()
			.listen(3000, () => this.logger.log('info', 'listen...', { service: 'main' }));
	}

	private create(): Express {
		this.application = express()
			.use(cors())
			.use(json(), urlencoded({ extended: true }))
			.use(log_request(this.logger), log_response(this.logger));

		this.apis.forEach(api => this.application.use(api.prefix, api.router));

		this.application.get('/', (request: Request, response: Response, next: NextFunction) => response.send('hello world'));

		this.application.use(catch_error, log_error(this.logger))

		return this.application;
	}
}
