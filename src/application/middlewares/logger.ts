import { Logger } from 'winston';
import { NextFunction, Request, Response, RequestHandler, ErrorRequestHandler } from 'express';

import { MSError, GeneralError } from '../../models/error';
import { User } from '../../models/user';


export function logRequest(logger: Logger): RequestHandler {
	return (request: Request, response: Response, next: NextFunction) => {
		const { url, params, query, headers, method, body, cookies } = request;
		const user: User = response.locals.currentUser;
		logger.log('http', 'income request', { request: { url, params, query, headers, method, body, cookies, user } });
		next()
	};
}

export function logResponse(logger: Logger): RequestHandler {
	return (request: Request, response: Response, next: NextFunction) => {
		const [oldWrite, oldEnd]: [...Function[]] = [response.write, response.end];
		const chunks: Buffer[] = [];

		(response.write as unknown) = function (chunk: ArrayBuffer | SharedArrayBuffer) {
			chunks.push(Buffer.from(chunk));
			oldWrite.apply(response, arguments);
		};

		(response.end as unknown) = function (chunk: ArrayBuffer | SharedArrayBuffer) {
			if (chunk) {
				chunks.push(Buffer.from(chunk));
			}
			const body: string = Buffer.concat(chunks).toString('utf8');
			const { statusCode, statusMessage } = response;
			const user: User = response.locals.currentUser;
			logger.log('http', 'outcome response', { response: { statusCode, statusMessage, body, user } });
			oldEnd.apply(response, arguments);
		};

		next();
	}
}

export function catchError(): ErrorRequestHandler {
	return (error: MSError | any, request: Request, response: Response, next: NextFunction) => {
		if (error.type === 'MSError') return next(error);

		const msError = GeneralError.fromError(error);
		return next(msError);
	}
}

export function logError(logger: Logger): ErrorRequestHandler {
	return (error: MSError, request: Request, response: Response, next: NextFunction) => {
		if (response.headersSent) return next(error);

		const user: User = response.locals.currentUser;
		const { name, message, stack, statusCode } = error;
		const errorMessage = `${name}: ${message}`;

		logger.log('error', errorMessage, { stack, user });

		response.status(statusCode).send(errorMessage);
	}
}
