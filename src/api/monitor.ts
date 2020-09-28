import { default as express, Router, Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import { sign } from 'jsonwebtoken';
import { User } from '../models/user';

import { API } from './api';
import { privateKey } from '../config/keys';


const test = () => true;

@injectable()
export class MonitorAPI implements API {
	public get router(): Router { return this._router; }
	public get prefix(): string { return '/monitor'; }

	private _router: Router;

	constructor() {
		this._router = express.Router()
			.get('/isAlive', (request: Request, response: Response, next: NextFunction) => response.send(true))
			.get('/isFunctioning', (request: Request, response: Response, next: NextFunction) => response.send(test()))
			.get('/token', (req, res) => {
				const isS: boolean = req.query.p.toString() === 'true';
				const lame: User = { _id: 'LameUser', name: 'Lame User', hierarchy: 'lame/user' };
				const superu: User = { _id: 'SuperUser', name: 'Super User', hierarchy: 'super/user' };
				const token = sign(isS ? superu : lame, privateKey, { expiresIn: '1h', algorithm: 'RS512' });
				res.cookie('token', token, { maxAge: 3600000 }).send();
			});
	}
}
