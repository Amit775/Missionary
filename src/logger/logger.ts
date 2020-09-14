import { MongoDB } from 'winston-mongodb';
import { createLogger, format, Logform, transports } from 'winston';

import config from '../config/config.json';
import { Transform } from 'stream';

const { combine, json, splat, simple, metadata } = format;
// const message: Logform.Format = { transform: (info: Logform.TransformableInfo) => { return { level: info.level, message: info.message } } };

export const logger = createLogger({
	format: combine(json({ space: 4 }), splat(), simple(), metadata()),
	defaultMeta: { app: 'missionary' },
	exitOnError: false,
	level: 'http',
	transports: [
		new transports.Console({ level: 'info' }),
		new MongoDB({
			level: 'http',
			db: config.db.uri,
			options: { useNewUrlParser: true, useUnifiedTopology: true }
		})
	]
});
