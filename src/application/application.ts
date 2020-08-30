import { INJECTOR } from '../config/types';
import { IConfig } from '../config/injector';
import { multiInject, inject, injectable } from 'inversify';
import express, { Request, Response, NextFunction, Express } from 'express';
import { Logger } from 'winston';
import { urlencoded, json } from 'body-parser';
import { log_request, log_response, log_error } from '../logger/middleware';
import { IController } from '../api/controller.interface';


@injectable()
export class Application {
	@multiInject(INJECTOR.Controllers) private controllers: IController[]
	@inject(INJECTOR.Logger) private loggerFactory: () => Logger;
	@inject(INJECTOR.Config) private config: IConfig;

	private logger: Logger;
	private application: Express;
	create(): Express {
		this.logger = this.loggerFactory();
		this.application = express()
			.use(json(), urlencoded({ extended: true }))
			.use(log_request(this.logger), log_response(this.logger))

		this.controllers.forEach(controller => this.application.use(controller.prefix, controller.router));
		this.application.get('/', (req: Request, res: Response, next: NextFunction) => res.send('hello world'))
			.use(log_error(this.logger))

		return this.application;
	}

	start(): Application {
		this.create()
			.listen(3000, () => this.logger.log('info', 'listen...', { service: 'main' }));
		return this;
	}

	log(message: string): void {
		this.logger.log('info', message);
	}
}

