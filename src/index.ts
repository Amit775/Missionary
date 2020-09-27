import 'reflect-metadata';

import { Injector, INJECTOR } from './config/injector';
import { Application } from './application/application';


Injector.get<Application>(INJECTOR.Application).start();
