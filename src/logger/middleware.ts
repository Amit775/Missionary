import { Logger } from 'winston';
import { NextFunction, Request, Response, RequestHandler, ErrorRequestHandler } from 'express';
import { MSError, GeneralError } from './error';

type LoggerMiddleware = (logger: Logger) => RequestHandler | ErrorRequestHandler;

export const log_request: LoggerMiddleware = (logger: Logger) => (request: Request, response: Response, next: NextFunction) => {
	const { url, params, query, headers, method, body } = request;
	logger.log('http', 'income request', { request: { url, params, query, headers, method, body } });
	next()
};

export const log_response: LoggerMiddleware = (logger: Logger) => (request: Request, response: Response, next: NextFunction) => {
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
		logger.log('http', 'outcome response', { response: { statusCode, statusMessage, body } });
		oldEnd.apply(response, arguments);
	};

	next();
}

export const catch_error: ErrorRequestHandler = (error: MSError | any, request: Request, response: Response, next: NextFunction) => {
	if (error.type === 'MSError') return next(error);

	const msError = GeneralError.fromError(error);
	return next(msError);
}

export const log_error: LoggerMiddleware = (logger: Logger) => (error: MSError, request: Request, response: Response, next: NextFunction) => {
	if (response.headersSent) return next(error);

	const { name, message, stack, statusCode } = error;
	const errorMessage = `${name}: ${message}`;

	logger.log('error', errorMessage, { stack });

	response.status(statusCode).send(errorMessage);
}
