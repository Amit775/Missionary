
import 'reflect-metadata';
import { INJECTOR } from './config/types';
import { Injector } from './config/injector';
import { Application } from './application/application';

const application = Injector.get<Application>(INJECTOR.Application);
application.start();
application.log('application start');