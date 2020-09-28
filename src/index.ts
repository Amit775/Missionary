import 'reflect-metadata';

import { Injector } from './config/injector';
import { INJECTOR } from './config/types';
import { Application } from './application/application';


Injector.get<Application>(INJECTOR.Application).start();
