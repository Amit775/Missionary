import { logger } from '../logger/logger';
import { IGroupsDAL, GroupsDAL } from '../dal/groups';
import { IGroupsBL, GroupsBL } from '../bl/groups';
import { UsersBL, IUsersBL } from '../bl/users';
import { UsersController } from '../api/users';
import { INJECTOR } from './types';
import { Container } from 'inversify'
import { Logger } from 'winston';
import { MonitorController } from '../api/monitor';
import { MissionsController } from '../api/missions';
import { MissionsBL, IMissionsBL } from '../bl/missions';
import { IMissionsDAL, MissionsDAL } from '../dal/missions';
import { IController } from '../api/controller.interface';
import config from './config.json';
import { Application } from '../application/application';
import { UsersDAL, IUsersDAL } from '../dal/users';
import { GroupsController } from '../api/groups';

export type IConfig = typeof config;

export const Injector = new Container();
Injector.bind<IUsersBL>(INJECTOR.UsersBL).to(UsersBL).inSingletonScope();
Injector.bind<IUsersDAL>(INJECTOR.UsersDAL).to(UsersDAL).inSingletonScope();
Injector.bind<IController>(INJECTOR.Controllers).to(UsersController).inSingletonScope();

Injector.bind<IGroupsBL>(INJECTOR.GroupsBL).to(GroupsBL).inSingletonScope();
Injector.bind<IGroupsDAL>(INJECTOR.GroupsDAL).to(GroupsDAL).inSingletonScope();
Injector.bind<IController>(INJECTOR.Controllers).to(GroupsController).inSingletonScope();

Injector.bind<IMissionsBL>(INJECTOR.MissionsBL).to(MissionsBL).inSingletonScope();
Injector.bind<IMissionsDAL>(INJECTOR.MissionsDAL).to(MissionsDAL).inSingletonScope();
Injector.bind<IController>(INJECTOR.Controllers).to(MissionsController).inSingletonScope();

Injector.bind<IController>(INJECTOR.Controllers).to(MonitorController).inSingletonScope();

Injector.bind<Logger>(INJECTOR.Logger).toConstantValue(logger);
Injector.bind<IConfig>(INJECTOR.Config).toConstantValue(config);

Injector.bind<Application>(INJECTOR.Application).to(Application).inSingletonScope();