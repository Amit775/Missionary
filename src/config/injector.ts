import { Container } from 'inversify'
import { Logger } from 'winston';

import { Application } from '../application/application';
import { UsersBL } from '../bl/users';
import { UsersDAL } from '../dal/users';
import { GroupsBL } from '../bl/groups';
import { GroupsDAL } from '../dal/groups';
import { MissionsBL } from '../bl/missions';
import { MissionsDAL } from '../dal/missions';
import { API } from '../api/api';
import { UsersAPI } from '../api/users';
import { GroupsAPI } from '../api/groups';
import { MonitorAPI } from '../api/monitor';
import { MissionsAPI } from '../api/missions';
import { logger } from '../application/logger';
import { default as config } from './config.json';
import { INJECTOR } from './types';
import { TreeNodesDAL } from 'src/dal/tree-nodes';


export type IConfig = typeof config;

export const Injector = new Container();
Injector.bind<Application>(INJECTOR.Application).to(Application).inSingletonScope();

Injector.bind<UsersBL>(INJECTOR.UsersBL).to(UsersBL).inSingletonScope();
Injector.bind<UsersDAL>(INJECTOR.UsersDAL).to(UsersDAL).inSingletonScope();
Injector.bind<API>(INJECTOR.APIS).to(UsersAPI).inSingletonScope();

Injector.bind<GroupsBL>(INJECTOR.GroupsBL).to(GroupsBL).inSingletonScope();
Injector.bind<GroupsDAL>(INJECTOR.GroupsDAL).to(GroupsDAL).inSingletonScope();
Injector.bind<API>(INJECTOR.APIS).to(GroupsAPI).inSingletonScope();

Injector.bind<MissionsBL>(INJECTOR.MissionsBL).to(MissionsBL).inSingletonScope();
Injector.bind<MissionsDAL>(INJECTOR.MissionsDAL).to(MissionsDAL).inSingletonScope();
Injector.bind<API>(INJECTOR.APIS).to(MissionsAPI).inSingletonScope();

Injector.bind<TreeNodesDAL>(INJECTOR.TreeNodesDAL).to(TreeNodesDAL).inSingletonScope();

Injector.bind<API>(INJECTOR.APIS).to(MonitorAPI).inSingletonScope();

Injector.bind<Logger>(INJECTOR.Logger).toConstantValue(logger);
Injector.bind<IConfig>(INJECTOR.Config).toConstantValue(config);
