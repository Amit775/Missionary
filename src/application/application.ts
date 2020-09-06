import express, { Request, Response, NextFunction, Express } from 'express';
import { multiInject, inject, injectable } from 'inversify';
import { urlencoded, json } from 'body-parser';
import { Logger } from 'winston';

import { INJECTOR } from '../config/types';
import { log_request, log_response, log_error } from '../logger/middleware';
import { IController } from '../api/controller.interface';


@injectable()
export class Application {
	@multiInject(INJECTOR.Controllers) private controllers: IController[]
	@inject(INJECTOR.Logger) private logger: Logger;

	private application: Express;

	start(): void {
		this.create()
			.listen(3000, () => this.logger.log('info', 'listen...', { service: 'main' }));
	}

	private create(): Express {
		this.application = express()
			.use(json(), urlencoded({ extended: true }))
			.use(log_request(this.logger), log_response(this.logger));

		this.controllers.forEach(controller => this.application.use(controller.prefix, controller.router));

		this.application.get('/', (req: Request, res: Response, next: NextFunction) => res.send('hello world'));

		this.application.use(log_error(this.logger))

		return this.application;
	}
}
