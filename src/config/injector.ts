import { Container } from 'inversify'
import { Logger } from 'winston';

import { INJECTOR } from './types';
import { Application } from '../application/application';
import { UsersBL } from '../bl/users';
import { UsersDAL } from '../dal/users';
import { GroupsBL } from '../bl/groups';
import { GroupsDAL } from '../dal/groups';
import { MissionsBL } from '../bl/missions';
import { MissionsDAL } from '../dal/missions';
import { IController } from '../api/controller.interface';
import { UsersController } from '../api/users';
import { GroupsController } from '../api/groups';
import { MonitorController } from '../api/monitor';
import { MissionsController } from '../api/missions';
import { logger } from '../logger/logger';
import config from './config.json';

export type IConfig = typeof config;

export const Injector = new Container();
Injector.bind<Application>(INJECTOR.Application).to(Application).inSingletonScope();

Injector.bind<UsersBL>(INJECTOR.UsersBL).to(UsersBL).inSingletonScope();
Injector.bind<UsersDAL>(INJECTOR.UsersDAL).to(UsersDAL).inSingletonScope();
Injector.bind<IController>(INJECTOR.Controllers).to(UsersController).inSingletonScope();

Injector.bind<GroupsBL>(INJECTOR.GroupsBL).to(GroupsBL).inSingletonScope();
Injector.bind<GroupsDAL>(INJECTOR.GroupsDAL).to(GroupsDAL).inSingletonScope();
Injector.bind<IController>(INJECTOR.Controllers).to(GroupsController).inSingletonScope();

Injector.bind<MissionsBL>(INJECTOR.MissionsBL).to(MissionsBL).inSingletonScope();
Injector.bind<MissionsDAL>(INJECTOR.MissionsDAL).to(MissionsDAL).inSingletonScope();
Injector.bind<IController>(INJECTOR.Controllers).to(MissionsController).inSingletonScope();

Injector.bind<IController>(INJECTOR.Controllers).to(MonitorController).inSingletonScope();

Injector.bind<Logger>(INJECTOR.Logger).toConstantValue(logger);
Injector.bind<IConfig>(INJECTOR.Config).toConstantValue(config);
