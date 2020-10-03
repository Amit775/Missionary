import 'reflect-metadata';

import { Application } from './application/application';
import { Injector } from './config/injector';
import { INJECTOR } from './config/types';


Injector.get<Application>(INJECTOR.Application).start();
