import express, { Request, Response, NextFunction } from 'express';
import { loggerFactory } from './logger/logger';
import { urlencoded, json } from 'body-parser';
import { log_request, log_response, log_error } from './logger/middleware';

const logger = loggerFactory()

const server = express();

server.use(json(), urlencoded({ extended: true }))
server.use(log_request(logger), log_response(logger));

server.get('/', (req: Request, res: Response, next: NextFunction) => res.send('hello world'));

server.use(log_error(logger));
server.listen(3000, () => logger.log('info', 'listen...', { service: 'main' }));