import { NextFunction, Request, RequestHandler, Response } from 'express';
import { MissingArgumentError, InvalidArgumentError } from '../logger/error';

type Name<T> = Extract<keyof T, string>;

interface Argument<T> {
	name: Name<T>;
	type?: 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined' | object;
	required?: boolean;
};

export interface TRequest<T> extends Request { body: T; }

export function validation<T>(args: (Name<T> | Argument<T>)[], allRequired?: boolean): RequestHandler {
	return (request: TRequest<T>, response: Response, next: NextFunction) => {
		request.body =
			args.map((arg: Name<T> | Argument<T>) => typeof arg === 'string' ? arg : arg.name)
				.reduce((body: T, key: Name<T>) => (body[key] = request.body[key], body), {} as T);

		for (let arg of args) {
			let { name, type, required }: Argument<T> = {
				type: 'string',
				required: false,
				... typeof arg === 'string' ? { name: arg } : arg,
			};

			const value = request.body[name];

			if (value == null && (allRequired || required))
				return next(new MissingArgumentError(name));
			if (value != null && typeof type === 'object' && (typeof value !== 'number' || typeof value !== 'string') && !Object.keys(type).includes(`${value}`))
				return next(new InvalidArgumentError(name, value));
			if (value != null && typeof type !== 'object' && typeof value !== type)
				return next(new InvalidArgumentError(name, value));
		}

		next();
	}
}
