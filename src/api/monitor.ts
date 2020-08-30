import express from 'express';

export const monitorRouter = express.Router()
	.get('/isalive', (req, res, next) => res.send(true))
	.get('/isfunctioning', (req, res, next) => res.send(test()));

const test = () => true;

