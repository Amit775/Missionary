import { Router } from 'express';

export interface API {
	router: Router;
	prefix: string;
}
