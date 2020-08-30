import { INJECTOR } from './types';
import { Container, interfaces } from 'inversify'
import { Logger } from 'winston';
import { loggerFactory } from '../logger/logger';
import { MissionsController } from './../api/missions';
import { MissionsBL, IMissionBL } from '../bl/missions';
import { IMissionDAL, MissionsDAL } from '../dal/missions';
import { IController } from '../api/missions';
import config from './config.json';
import { Application } from '../application/application';

export type IConfig = typeof config;

export const Injector = new Container();
Injector.bind<IMissionBL>(INJECTOR.MissionsBL).to(MissionsBL).inSingletonScope();
Injector.bind<IMissionDAL>(INJECTOR.MissionsDAL).to(MissionsDAL).inSingletonScope();
Injector.bind<IController>(INJECTOR.Controllers).to(MissionsController).inSingletonScope();
Injector.bind<Logger>(INJECTOR.Logger).toFactory((_context: interfaces.Context) => () => loggerFactory());
Injector.bind<IConfig>(INJECTOR.Config).toConstantValue(config);
Injector.bind<Application>(INJECTOR.Application).to(Application).inSingletonScope();